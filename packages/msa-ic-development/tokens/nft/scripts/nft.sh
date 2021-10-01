dfxDir="/home/dan/.config/dfx"
candidDir="/home/dan/dev/psy/tokens/nft/candid"

NftID=$(dfx canister id nft)
DefaultPem="${dfxDir}/identity/default/identity.pem"
AlicePem="${dfxDir}/identity/Alice/identity.pem"
BobPem="${dfxDir}/identity/Bob/identity.pem"
CharliePem="${dfxDir}/identity/Charlie/identity.pem"
NftCandidFile="${candidDir}/nft.did"
DefaultPrincipalId=$(dfx identity use Default 2>/dev/null;dfx identity get-principal)
AlicePrincipalId=$(dfx identity use Alice 2>/dev/null;dfx identity get-principal)
BobPrincipalId=$(dfx identity use Bob 2>/dev/null;dfx identity get-principal)
CharliePrincipalId=$(dfx identity use Charlie 2>/dev/null;dfx identity get-principal)
DefaultAccountId=$(dfx identity use default 2>/dev/null;dfx ledger account-id)
AliceAccountId=$(dfx identity use Alice 2>/dev/null;dfx ledger account-id)
BobAccountId=$(dfx identity use Bob 2>/dev/null;dfx ledger account-id)
CharlieAccountId=$(dfx identity use Charlie 2>/dev/null;dfx ledger account-id)
IcxPrologueNft="--candid=${NftCandidFile}"
dfx identity use default 2>/dev/null

declare -A nameToPrincipal=( ["Alice"]="$AlicePrincipalId" ["Bob"]="$BobPrincipalId" ["Charlie"]="$CharliePrincipalId" ["default"]="$DefaultPrincipalId")
declare -A nameToPem=( ["Alice"]="$AlicePem" ["Bob"]="$BobPem" ["Charlie"]="$CharliePem" ["Default"]="$DefaultPem")

help()
{
    printf "\n\nPrincipal ids\n"
    printf "Alice: ${AlicePrincipalId}\n"
    printf "Bob: ${BobPrincipalId}\n"
    printf "Charlie: ${CharliePrincipalId}\n"

    printf "\n\nAccount ids\n"
    printf "Alice: ${AliceAccountId}\n"
    printf "Bob: ${BobAccountId}\n"
    printf "Charlie: ${CharlieAccountId}\n\n\n"
}

mintNFT() {
	mint_for="${nameToPrincipal[$1]}"
	icx --pem=$DefaultPem update $NftID mintNFT "(record {metadata= opt variant {\"blob\" = vec{1;2;3}}; to= variant {\"principal\"= principal \"$mint_for\"}})" $IcxPrologueNft
}

metadata() {
	token_id=$1
	icx --pem=$DefaultPem query $NftID metadata \"$token_id\" $IcxPrologueNft
}

bearer() {
	token_id=$1
	icx --pem=$DefaultPem query $NftID bearer \"$token_id\" $IcxPrologueNft
}

supply() {
	token_id=$1
	icx --pem=$DefaultPem query $NftID supply \"$token_id\" $IcxPrologueNft
}

getAllMetadataForUser() {
	user="${nameToPrincipal[$1]}"
	icx --pem=$DefaultPem query $NftID getAllMetadataForUser "(variant {\"principal\" = principal \"$user\"})" $IcxPrologueNft
}

transfer() {
	from_principal="${nameToPrincipal[$1]}"
	from_pem="${nameToPem[$1]}"
	to_principal="${nameToPrincipal[$2]}"
	token_id=$3
	icx --pem=$from_pem update $NftID transfer "(record {amount = 1; from = variant {\"principal\" = principal \"$from_principal\"}; memo = vec{}; notify = true; SubAccount = null; to = variant {\"principal\" = principal \"$to_principal\"}; token = \"$token_id\"})" $IcxPrologueNft
}
