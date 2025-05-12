// src\lib\aws\cognito.ts
import {
  CognitoUserPool,
  CognitoUser,
} from 'amazon-cognito-identity-js'

const poolData = {
  UserPoolId: 'us-east-1_iVomSPj8O',
  ClientId: '38f5ummg4pu7le5rsdegepsmd5',
}

const userPool = new CognitoUserPool(poolData)

export const forgotPassword = (username: string): Promise<void> => {
  const user = new CognitoUser({
    Username: username,
    Pool: userPool,
  })

  return new Promise((resolve, reject) => {
    user.forgotPassword({
      onSuccess: (result) => {
        console.log('Password reset initiated:', result)
        resolve()
      },
      onFailure: (err) => {
        console.error('Error initiating password reset:', err)
        reject(err)
      },
    })
  })
}





export const confirmForgotPassword = (
  username: string,
  code: string,
  newPassword: string
): Promise<void> => {
  const user = new CognitoUser({
    Username: username,
    Pool: userPool,
  })

  return new Promise((resolve, reject) => {
    user.confirmPassword(code, newPassword, {
      onSuccess: () => {
        console.log("Password reset successful")
        resolve()
      },
      onFailure: (err) => {
        console.error("Error resetting password:", err)
        reject(err)
      },
    })
  })
}
