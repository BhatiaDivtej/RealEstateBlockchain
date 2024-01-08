from brownie import LandRegistry, accounts, config

def register_land(account, _location, _parcelID, _price):
    land_registry = LandRegistry[-1]
    tx = land_registry.registerLand(_location, _parcelID, _price, {'from': account})
    tx.wait(1)
    print(f"Land with parcel ID {_parcelID} registered by {account.address}")
    return tx

def main():
    # Use registrar account
    registrar_account = accounts.add(config["wallets"]["from_key_registrar"])
    
    # Dummy data for demonstration
    _location = "6 Lung Wah Rd, Kennedy Town"
    _parcelID = "kennedytown1"
    _price = 20000000000000000 # 0.02 ETH in wei

    # Dummy data for demonstration
    # _location = "6B Sassoon Road, Pok Fu Lam"
    # _parcelID = "pokfulam1"
    # _price = 10000000000000000 # 0.01 ETH in wei
    
    register_land(registrar_account, _location, _parcelID, _price)