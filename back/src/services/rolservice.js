class Rolservice {
  static rolByMail (mail) {
    const regex = /@frlp\.utn\.edu\.ar$/
    return regex.test(mail)
  }
}

module.exports = Rolservice
