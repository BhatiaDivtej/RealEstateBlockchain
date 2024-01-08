from brownie import LandRegistry, accounts, config

def transfer_land(account, new_owner, parcel_id):
    land_registry = LandRegistry[-1]  # Fetch the latest deployed LandRegistry contract
    tx = land_registry.transferLand(new_owner, parcel_id, {'from': account})
    tx.wait(1)  # Wait for the transaction to be mined
    print(f"Land with parcel ID {parcel_id} transferred to {new_owner}.")
    return tx

def main():
    # Use transferer account, which is set in the brownie-config.yaml
    transferer_account = accounts.add(config["wallets"]["from_key_registrar"])
    
    # Dummy data for demonstration
    new_owner = accounts.add(config["wallets"]["from_key_buyer"]).address
    parcel_id = "kennedytown1"
    
    # Call the transfer function
    transfer_land(transferer_account, new_owner, parcel_id)