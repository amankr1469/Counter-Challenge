module counter_addr::counter {
    use std::signer;
    use aptos_framework::account;
    const E_NOT_INITIALIZED: u64 = 1;

    struct ClickCounts has key {
        count: u64
    }

    public entry fun initialize(account: &signer) {
        let addr = signer::address_of(account);
    
        if (!exists<ClickCounts>(addr)) {
            move_to(account, ClickCounts { count: 0 });
        }
    }

    public entry fun increment(account: &signer) acquires ClickCounts {
        let signer_address = signer::address_of(account);
        assert!(exists<ClickCounts>(signer_address), E_NOT_INITIALIZED);
        let countvar = borrow_global_mut<ClickCounts>(signer_address);
        let counter = countvar.count + 1;
        countvar.count = counter;
    }

    #[test(admin = @0x123)]
    public entry fun test_flow(admin: signer) acquires ClickCounts {
        account::create_account_for_test(signer::address_of(&admin));
        initialize(&admin);
        increment(&admin);
    }
}