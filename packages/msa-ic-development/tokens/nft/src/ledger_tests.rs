#[cfg(test)]
mod tests {

    use crate::ledger::*;
    use crate::types::*;

    use ic_kit::mock_principals::*;
    #[test]
    fn ledger_mint() {
        let mut ledger = Ledger::default();
        let alice = User::principal(alice());
        let mint_request_alice = MintRequest {
            metadata: None,
            to: alice,
        };

        let alice_token_id = ledger.mintNFT(&mint_request_alice);
        //println!("{:?}", ledger.bearer(&alice_token_id));
        //let y:i32 = ledger.bearer(&alice_token_id).unwrap();
    }
}
