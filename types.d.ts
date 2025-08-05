interface Account {
    label: string
    issuer: string
    secret: string
    uri: string
  }
  
  interface SessionData {
    accounts: Account[]
  }