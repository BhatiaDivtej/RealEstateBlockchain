from brownie import LandRegistry, accounts, config

def list_lands_by_owner(_owner):
    land_registry = LandRegistry[-1]
    return land_registry.listLandsByOwner(_owner)

def main():
    # Use any account to list lands, here we use the registrar
    # owner_account = accounts.add(config["wallets"]["from_key_registrar"])
    owner_account = accounts.add(config["wallets"]["from_key_buyer"])

    land_list = list_lands_by_owner(owner_account.address)
    print(f"Lands owned by {owner_account.address}: {land_list}")