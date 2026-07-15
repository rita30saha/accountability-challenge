#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, String};

// Declare the Escrow client interface
pub mod escrow_contract {
    use soroban_sdk::{contractclient, Address, Env};
    
    #[contractclient(name = "EscrowClient")]
    pub trait EscrowInterface {
        fn initialize(env: Env, manager: Address, token: Address);
        fn lock(env: Env, from: Address, amount: i128, challenge_id: u64);
        fn release(env: Env, to: Address, amount: i128, challenge_id: u64);
    }
}

#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum ChallengeStatus {
    Created = 0,
    Active = 1,
    Completed = 2,
    Failed = 3,
    Expired = 4,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Challenge {
    pub id: u64,
    pub creator: Address,
    pub title: String,
    pub description: String,
    pub amount: i128,
    pub deadline: u64,
    pub partner: Address,
    pub status: ChallengeStatus,
    pub created_at: u64,
}

#[contracttype]
#[derive(Clone)]
enum DataKey {
    Admin,
    Escrow,
    Token,
    Initialized,
    Challenge(u64),
    Counter,
}

#[contract]
pub struct ChallengeManagerContract;

#[contractimpl]
impl ChallengeManagerContract {
    pub fn initialize(env: Env, admin: Address, escrow: Address, token: Address) {
        if env.storage().instance().has(&DataKey::Initialized) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Escrow, &escrow);
        env.storage().instance().set(&DataKey::Token, &token);
        env.storage().instance().set(&DataKey::Counter, &0u64);
        env.storage().instance().set(&DataKey::Initialized, &true);
    }

    pub fn create_challenge(
        env: Env,
        creator: Address,
        partner: Address,
        title: String,
        description: String,
        amount: i128,
        deadline: u64,
    ) -> u64 {
        creator.require_auth();

        assert!(amount > 0, "Amount must be positive");
        assert!(deadline > env.ledger().timestamp(), "Deadline must be in the future");
        assert!(creator != partner, "Creator and partner must be different");

        let mut counter: u64 = env.storage().instance().get(&DataKey::Counter).unwrap_or(0);
        counter += 1;
        env.storage().instance().set(&DataKey::Counter, &counter);

        let challenge = Challenge {
            id: counter,
            creator: creator.clone(),
            title: title.clone(),
            description: description.clone(),
            amount,
            deadline,
            partner: partner.clone(),
            status: ChallengeStatus::Active,
            created_at: env.ledger().timestamp(),
        };

        env.storage().persistent().set(&DataKey::Challenge(counter), &challenge);

        // Call escrow to lock the funds
        let escrow_address: Address = env.storage().instance().get(&DataKey::Escrow).expect("Escrow not configured");
        let escrow_client = escrow_contract::EscrowClient::new(&env, &escrow_address);
        escrow_client.lock(&creator, &amount, &counter);

        // Emit events
        env.events().publish(
            (symbol_short!("created"), counter, creator),
            (partner, amount, deadline),
        );
        env.events().publish(
            (symbol_short!("active"), counter),
            (),
        );

        counter
    }

    pub fn complete_challenge(env: Env, id: u64) {
        let mut challenge: Challenge = env.storage().persistent().get(&DataKey::Challenge(id))
            .expect("Challenge not found");

        assert!(challenge.status == ChallengeStatus::Active, "Challenge must be active");
        challenge.partner.require_auth();

        challenge.status = ChallengeStatus::Completed;
        env.storage().persistent().set(&DataKey::Challenge(id), &challenge);

        // Release funds back to creator
        let escrow_address: Address = env.storage().instance().get(&DataKey::Escrow).expect("Escrow not configured");
        let escrow_client = escrow_contract::EscrowClient::new(&env, &escrow_address);
        escrow_client.release(&challenge.creator, &challenge.amount, &id);

        env.events().publish(
            (symbol_short!("complete"), id),
            challenge.creator.clone(),
        );
    }

    pub fn fail_challenge(env: Env, id: u64, caller: Address) {
        let mut challenge: Challenge = env.storage().persistent().get(&DataKey::Challenge(id))
            .expect("Challenge not found");

        assert!(challenge.status == ChallengeStatus::Active, "Challenge must be active");
        assert!(caller == challenge.creator || caller == challenge.partner, "Caller must be creator or partner");
        caller.require_auth();

        challenge.status = ChallengeStatus::Failed;
        env.storage().persistent().set(&DataKey::Challenge(id), &challenge);

        // Release funds to accountability partner
        let escrow_address: Address = env.storage().instance().get(&DataKey::Escrow).expect("Escrow not configured");
        let escrow_client = escrow_contract::EscrowClient::new(&env, &escrow_address);
        escrow_client.release(&challenge.partner, &challenge.amount, &id);

        env.events().publish(
            (symbol_short!("fail"), id),
            challenge.partner.clone(),
        );
    }

    pub fn expire_challenge(env: Env, id: u64) {
        let mut challenge: Challenge = env.storage().persistent().get(&DataKey::Challenge(id))
            .expect("Challenge not found");

        assert!(challenge.status == ChallengeStatus::Active, "Challenge must be active");
        assert!(env.ledger().timestamp() > challenge.deadline, "Deadline has not passed yet");

        challenge.status = ChallengeStatus::Expired;
        env.storage().persistent().set(&DataKey::Challenge(id), &challenge);

        // Release funds to accountability partner
        let escrow_address: Address = env.storage().instance().get(&DataKey::Escrow).expect("Escrow not configured");
        let escrow_client = escrow_contract::EscrowClient::new(&env, &escrow_address);
        escrow_client.release(&challenge.partner, &challenge.amount, &id);

        env.events().publish(
            (symbol_short!("expire"), id),
            challenge.partner.clone(),
        );
    }

    pub fn get_challenge(env: Env, id: u64) -> Option<Challenge> {
        env.storage().persistent().get(&DataKey::Challenge(id))
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::{Address as _, Ledger}, token, Address, Env};
    use escrow::EscrowContract;

    fn setup_test(env: &Env) -> (Address, Address, Address, Address, ChallengeManagerContractClient<'_>, Address) {
        let admin = Address::generate(env);
        let creator = Address::generate(env);
        let partner = Address::generate(env);

        // Register token
        let token_admin = Address::generate(env);
        let token_address = env.register_stellar_asset_contract_v2(token_admin).address();
        let token_admin_client = token::StellarAssetClient::new(env, &token_address);

        // Register Escrow
        let escrow_address = env.register_contract(None, EscrowContract);
        let escrow_client = escrow::EscrowContractClient::new(env, &escrow_address);

        // Register Challenge Manager
        let manager_address = env.register_contract(None, ChallengeManagerContract);
        let manager_client = ChallengeManagerContractClient::new(env, &manager_address);

        // Initialize Escrow
        escrow_client.initialize(&manager_address, &token_address);

        // Initialize Challenge Manager
        manager_client.initialize(&admin, &escrow_address, &token_address);

        // Mint XLM to creator
        token_admin_client.mint(&creator, &1000i128);

        (admin, creator, partner, token_address, manager_client, escrow_address)
    }

    #[test]
    fn test_create_challenge() {
        let env = Env::default();
        env.mock_all_auths();

        let (_admin, creator, partner, token_address, manager_client, escrow_address) = setup_test(&env);
        let token_client = token::Client::new(&env, &token_address);

        let title = String::from_str(&env, "Workout Challenge");
        let description = String::from_str(&env, "Workout every day for 30 days");
        let amount = 100i128;
        let deadline = env.ledger().timestamp() + 3600; // 1 hour in the future

        let challenge_id = manager_client.create_challenge(
            &creator,
            &partner,
            &title,
            &description,
            &amount,
            &deadline
        );

        assert_eq!(challenge_id, 1);

        // Verify challenge data stored correctly
        let challenge = manager_client.get_challenge(&challenge_id).unwrap();
        assert_eq!(challenge.id, 1);
        assert_eq!(challenge.creator, creator);
        assert_eq!(challenge.partner, partner);
        assert_eq!(challenge.amount, amount);
        assert_eq!(challenge.deadline, deadline);
        assert_eq!(challenge.status, ChallengeStatus::Active);

        // Verify token transfer
        assert_eq!(token_client.balance(&creator), 900);
        assert_eq!(token_client.balance(&escrow_address), 100);
    }

    #[test]
    fn test_complete_challenge() {
        let env = Env::default();
        env.mock_all_auths();

        let (_admin, creator, partner, token_address, manager_client, escrow_address) = setup_test(&env);
        let token_client = token::Client::new(&env, &token_address);

        let title = String::from_str(&env, "Study");
        let description = String::from_str(&env, "Study Soroban");
        let amount = 200i128;
        let deadline = env.ledger().timestamp() + 1000;

        let challenge_id = manager_client.create_challenge(&creator, &partner, &title, &description, &amount, &deadline);

        // Partner completes it
        manager_client.complete_challenge(&challenge_id);

        let challenge = manager_client.get_challenge(&challenge_id).unwrap();
        assert_eq!(challenge.status, ChallengeStatus::Completed);

        // Funds returned to creator
        assert_eq!(token_client.balance(&creator), 1000);
        assert_eq!(token_client.balance(&escrow_address), 0);
    }

    #[test]
    fn test_fail_challenge_by_creator() {
        let env = Env::default();
        env.mock_all_auths();

        let (_admin, creator, partner, token_address, manager_client, escrow_address) = setup_test(&env);
        let token_client = token::Client::new(&env, &token_address);

        let title = String::from_str(&env, "Coding");
        let description = String::from_str(&env, "Code accountability app");
        let amount = 300i128;
        let deadline = env.ledger().timestamp() + 1000;

        let challenge_id = manager_client.create_challenge(&creator, &partner, &title, &description, &amount, &deadline);

        // Creator fails it voluntarily
        manager_client.fail_challenge(&challenge_id, &creator);

        let challenge = manager_client.get_challenge(&challenge_id).unwrap();
        assert_eq!(challenge.status, ChallengeStatus::Failed);

        // Funds sent to partner
        assert_eq!(token_client.balance(&creator), 700);
        assert_eq!(token_client.balance(&partner), 300);
        assert_eq!(token_client.balance(&escrow_address), 0);
    }

    #[test]
    fn test_fail_challenge_by_partner() {
        let env = Env::default();
        env.mock_all_auths();

        let (_admin, creator, partner, token_address, manager_client, escrow_address) = setup_test(&env);
        let token_client = token::Client::new(&env, &token_address);

        let title = String::from_str(&env, "Habit");
        let description = String::from_str(&env, "Sleep by 10pm");
        let amount = 400i128;
        let deadline = env.ledger().timestamp() + 1000;

        let challenge_id = manager_client.create_challenge(&creator, &partner, &title, &description, &amount, &deadline);

        // Partner fails it
        manager_client.fail_challenge(&challenge_id, &partner);

        let challenge = manager_client.get_challenge(&challenge_id).unwrap();
        assert_eq!(challenge.status, ChallengeStatus::Failed);

        // Funds sent to partner
        assert_eq!(token_client.balance(&creator), 600);
        assert_eq!(token_client.balance(&partner), 400);
        assert_eq!(token_client.balance(&escrow_address), 0);
    }

    #[test]
    fn test_expire_challenge() {
        let env = Env::default();
        env.mock_all_auths();

        let (_admin, creator, partner, token_address, manager_client, escrow_address) = setup_test(&env);
        let token_client = token::Client::new(&env, &token_address);

        let title = String::from_str(&env, "Study");
        let description = String::from_str(&env, "Study Spanish");
        let amount = 100i128;
        let deadline = env.ledger().timestamp() + 1000;

        let challenge_id = manager_client.create_challenge(&creator, &partner, &title, &description, &amount, &deadline);

        // Fast forward ledger time past deadline
        env.ledger().set_timestamp(deadline + 1);

        // Expire challenge
        manager_client.expire_challenge(&challenge_id);

        let challenge = manager_client.get_challenge(&challenge_id).unwrap();
        assert_eq!(challenge.status, ChallengeStatus::Expired);

        // Funds sent to partner due to expiration/failure
        assert_eq!(token_client.balance(&creator), 900);
        assert_eq!(token_client.balance(&partner), 100);
        assert_eq!(token_client.balance(&escrow_address), 0);
    }

    #[test]
    #[should_panic]
    fn test_create_challenge_invalid_deadline() {
        let env = Env::default();
        env.mock_all_auths();

        let (_admin, creator, partner, _token_address, manager_client, _escrow_address) = setup_test(&env);

        let title = String::from_str(&env, "Invalid");
        let description = String::from_str(&env, "Invalid");
        let amount = 100i128;
        // Deadline in the past
        let deadline = env.ledger().timestamp() - 1;

        manager_client.create_challenge(&creator, &partner, &title, &description, &amount, &deadline);
    }
}
