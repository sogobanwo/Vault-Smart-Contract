import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("VaultTest", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployVaultContract() {

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const VaultContract = await ethers.getContractFactory("VaultContract");
    const vaultContract = await VaultContract.deploy();

    return { vaultContract, owner, otherAccount };
  }

  describe("DonateGrant", function () {
    it("It should return with an error message when 0 value is inputed ", async function () {
      const { vaultContract, otherAccount } = await loadFixture(deployVaultContract);

      await expect(vaultContract.donateGrant(otherAccount, 20, {value: 0})).to.be.revertedWith("Can't save 0 value");
    });

    it("It should not return with an error message when a value higher than 0 is inputed", async function () {
      const { vaultContract, otherAccount } = await loadFixture(deployVaultContract);

      await expect(vaultContract.donateGrant(otherAccount, 20, {value: 1})).to.not.be.revertedWith("Can't save 0 value");
    });

    it("The contract balance should be equal to amount deposit", async function () {
      const { vaultContract, otherAccount } = await loadFixture(deployVaultContract);
      (await vaultContract.donateGrant(otherAccount, 20, {value: 1})).wait();

      expect(await ethers.provider.getBalance(vaultContract.target)).to.equal(1);
    });
  });

  describe("claimGrant", function () {
    it("It should be reverted with an error if the address has no grant", async function () {
      const { vaultContract, otherAccount } = await loadFixture(deployVaultContract);

      await expect(vaultContract.claimGrant(1)).to.be.revertedWith("You don't have any grant");
    });

    it("It should be reverted with an error if time of maturity has not ellapsed", async function () {
      const { vaultContract, otherAccount } = await loadFixture(deployVaultContract);

      (await vaultContract.donateGrant(otherAccount, 1000, {value: 1})).wait();

      await expect(vaultContract.connect(otherAccount).claimGrant(1)).to.be.revertedWith("Your grant has not matured")

    });

    it("The contract balance should be equal to amount deposit", async function () {
      const { vaultContract, otherAccount } = await loadFixture(deployVaultContract);

      (await vaultContract.donateGrant(otherAccount, 10, {value: 1})).wait();

      await time.increase(20);

      const initialBalance = await ethers.provider.getBalance(otherAccount.address);

      (await vaultContract.connect(otherAccount).claimGrant(1)).wait();

      expect(initialBalance).to.be.lessThan(BigInt(initialBalance) + BigInt(1));

    });
  });
  
});
