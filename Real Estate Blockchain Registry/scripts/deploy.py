from brownie import accounts, config, LandRegistry, network

def deploy_land_registry():
    account = get_account()
    print(f"Deploying from account: {account}")
    land_registry = LandRegistry.deploy({"from": account})
    print(f"LandRegistry deployed at: {land_registry.address}")

def get_account():
    active_network = network.show_active()
    print(f"Active network: {active_network}")
    if active_network == "development":
        return accounts[0]
    else:
        return accounts.add(config["wallets"]["from_key_registrar"])

def main():
    deploy_land_registry()