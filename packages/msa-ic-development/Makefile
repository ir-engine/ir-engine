user_profile:
	cargo build --target wasm32-unknown-unknown --package user_profile --release

	ic-cdk-optimizer ./target/wasm32-unknown-unknown/release/user_profile.wasm -o ./target/wasm32-unknown-unknown/release/user_profile_opt.wasm

wall:
	cargo build --target wasm32-unknown-unknown --package wall --release

	ic-cdk-optimizer ./target/wasm32-unknown-unknown/release/wall.wasm -o ./target/wasm32-unknown-unknown/release/wall_opt.wasm

copy_dfx_generated:
	cp -R ./.dfx/local/canisters ./src/ic/canisters_generated