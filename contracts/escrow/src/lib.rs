#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, token};

#[contracttype]
#[derive(Clone)]
enum DataKey {
    Manager,
    Token,
    Initialized,
}

#[contract]
pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {
    pub fn initialize(env: Env, manager: Address, token: Address) {
        if env.storage().instance().has(&DataKey::Initialized) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&DataKey::Manager, &manager);
        env.storage().instance().set(&DataKey::Token, &token);
        env.storage().instance().set(&DataKey::Initialized, &true);
    }

    pub fn lock(env: Env, from: Address, amount: i128, challenge_id: u64) {
        let manager: Address = env.storage().instance().get(&DataKey::Manager).expect("Not initialized");
        manager.require_auth();
        from.require_auth();

        assert!(amount > 0, "Amount must be positive");

        let token_address: Address = env.storage().instance().get(&DataKey::Token).expect("Not initialized");
        let token_client = token::Client::new(&env, &token_address);
        token_client.transfer(&from, &env.current_contract_address(), &amount);

        env.events().publish(
            (symbol_short!("lock"), challenge_id, from),
            amount,
        );
    }

    pub fn release(env: Env, to: Address, amount: i128, challenge_id: u64) {
        let manager: Address = env.storage().instance().get(&DataKey::Manager).expect("Not initialized");
        manager.require_auth();

        let token_address: Address = env.storage().instance().get(&DataKey::Token).expect("Not initialized");
        let token_client = token::Client::new(&env, &token_address);
        token_client.transfer(&env.current_contract_address(), &to, &amount);

        env.events().publish(
            (symbol_short!("release"), challenge_id, to),
            amount,
        );
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Address, Env};

    #[test]
    fn test_initialize() {
        let env = Env::default();
        let manager = Address::generate(&env);
        let token = Address::generate(&env);
        let escrow_id = env.register_contract(None, EscrowContract);
        let client = EscrowContractClient::new(&env, &escrow_id);

        client.initialize(&manager, &token);
        // check second initialization panics
        let res = client.try_initialize(&manager, &token);
        assert!(res.is_err());
    }

    #[test]
    fn test_lock_and_release() {
        let env = Env::default();
        env.mock_all_auths();

        let manager = Address::generate(&env);
        let creator = Address::generate(&env);
        let partner = Address::generate(&env);

        // Register token
        let token_admin = Address::generate(&env);
        let token_address = env.register_stellar_asset_contract_v2(token_admin).address();
        let token_client = token::Client::new(&env, &token_address);

        // Register escrow
        let escrow_id = env.register_contract(None, EscrowContract);
        let client = EscrowContractClient::new(&env, &escrow_id);
        client.initialize(&manager, &token_address);

        // Mint tokens to creator
        let mint_amount = 1000i128;
        let token_admin_client = token::StellarAssetClient::new(&env, &token_address);
        token_admin_client.mint(&creator, &mint_amount);
        assert_eq!(token_client.balance(&creator), mint_amount);

        // Lock funds
        let lock_amount = 100i128;
        client.lock(&creator, &lock_amount, &1u64);

        // Verify balance updates
        assert_eq!(token_client.balance(&creator), mint_amount - lock_amount);
        assert_eq!(token_client.balance(&escrow_id), lock_amount);

        // Release funds to creator (Completed case)
        client.release(&creator, &lock_amount, &1u64);
        assert_eq!(token_client.balance(&creator), mint_amount);
        assert_eq!(token_client.balance(&escrow_id), 0);

        // Release funds to partner (Failed case)
        token_admin_client.mint(&creator, &lock_amount);
        client.lock(&creator, &lock_amount, &2u64);
        client.release(&partner, &lock_amount, &2u64);
        assert_eq!(token_client.balance(&partner), lock_amount);
    }

    #[test]
    #[should_panic]
    fn test_unauthorized_lock() {
        let env = Env::default();
        let manager = Address::generate(&env);
        let creator = Address::generate(&env);
        let token_address = Address::generate(&env);

        let escrow_id = env.register_contract(None, EscrowContract);
        let client = EscrowContractClient::new(&env, &escrow_id);
        client.initialize(&manager, &token_address);

        // Call lock directly without manager's authorization. Since we didn't call env.mock_all_auths(),
        // require_auth will check if there is an authorization for the manager.
        // It will fail because manager is not in the invocation stack.
        client.lock(&creator, &100i128, &1u64);
    }
}
