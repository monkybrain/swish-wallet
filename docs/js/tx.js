const Web3 = require('web3')
const CryptoJS = require('crypto-js')
const EthereumTx = require('ethereumjs-tx')
var web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/0pzfHdAhsqakqtBk8Hs6"))

window.sendEther = function() {

  // Get password
  let password = prompt("Ange lösenord")

  // Decrypt private key
  let encryptedKey = localStorage.getItem("privateKey")
  let privateKey = CryptoJS.AES.decrypt(encryptedKey, password).toString(CryptoJS.enc.Utf8)

  // If wrong password -> alert and return
  if (!privateKey) {
    alert('Fel lösenord')
    return;
  }

  // Construct transaction
  let address = document.getElementById("input-send-address").value
  let amount = web3.utils.toWei(document.getElementById("input-send-amount").value, 'ether')
  let nonce = 0
  console.log(address)

  // Get nonce
  web3.eth.getTransactionCount(address)
  .then((count) => {
    nonce = count
    console.log("Nonce: " + nonce)
  })
  // Get gas price
  .then(() => web3.eth.getGasPrice())
  // Sign transaction
  .then((gasPrice) => {
    console.log("Gas price: " + gasPrice)
    const txParams = {
      nonce: web3.utils.toHex(nonce),
      to: address,
      gasPrice: web3.utils.toHex(gasPrice),
      gasLimit: web3.utils.toHex(290000),
      value: web3.utils.toHex(amount),
      chainId: 3
    }
    console.log(txParams)
    const tx = new EthereumTx(txParams)
    tx.sign(Buffer.from(privateKey, 'hex'))
    return "0x" + tx.serialize().toString('hex')
  })
  // Send transaction
  .then((txData) => {
    web3.eth.sendSignedTransaction(txData, (err, txHash) => {
      if (!err) {
        console.log("Tx hash: " + txHash);
        document.getElementById("etherscan-tx").href = "https://ropsten.etherscan.io/tx/" + txHash
        setPage("tx")
      } else {
        alert(err)
        console.log(err)
      }
    })
  })
  .then(function(result) {
    setPage("transaction")
  })
  .catch(function(err) {
    console.log(err)
    alert(err)
  })

}
