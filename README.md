# EcoSwap - Backend

# REST API

[See this video for introduction](https://youtu.be/-MTSQjw5DrM?si=2oWyxqk7njAVh_sH)

**IMPORTANT**
- output only shown for GET endpoints
- after login, the server will be able to know who made the request. No additional code needed in axios. If you want to know how, see [this](https://youtu.be/UBUNrFtufWo?si=MnWYYKEAxgpF2wmd
) video on cookie (we did not use JWT)

## What do i send?



|component| METHOD | Path | Query | Body |
| :-:| :-:| :-:|:-:| :-:| 
|example | `POST` |`/resource` | `?key=val` | json |

**Note the difference between query and body**


```javascript
this.axios.post('https://.../resource', {
    //body here
},{
    params : {
        key: val // query here PLEASE DONT PUT IN PATH, LATER ERROR
    }
}).then(...
```
*IMPORTANT* - GET does not have a body
```javascript
this.axios.get('https://.../resource',{
    params : {
        key: val // query here
    }
}).then(...
```

## What is returned?
In the then clause of axios, a `response`/`error` variable is received with the following contents
``` javascript

//error have the same structure too
response = {
  // `data` is the response that was provided by the server
  data: 
    {
        "status" : ,// usually success or something along that line
        "problem" : //if code is not 200
        "data" : //if it is a get request

    },

  // `status` is the HTTP status code from the server response
  status: 200,

  // `statusText` is the HTTP status message from the server response
  statusText: 'OK',

  //Ignore the rest

}
```


| Status | Meaning | Description |
|:-:|:-:| :-:|
| `200` |` OK` | No issue |
| `400`| `Bad Request` | Issue with the query
| `401` | `Unauthenticated` | You haven't logged in/you are not allowed to modify item that is not yours/OTP issue |
| `500` | `Internal server error` | Usually an error with database |

## A. User API Endpoints

- None require query 
- one OTP can be used for either confirming email/changing password
- all POST need a body

| METHOD | Purpose |  Path | Need login |
| :-:| :-:| :-:|:-:|
| `POST` |Register - auto send OTP|`/user/register`   | No |
| `POST` |Login|`/user/login`  | No |
| `GET` |Logout|`/user/logout`  | Yes |
| `GET` |generate OTP for email verification or change password|`/user/generateOTP` | Yes |
| `POST` |*OTP required* - change password  |`/user/confirmPassword` | Yes |
| `POST` |*OTP required* - confirm already registered email  |`/user/confirmEmail` | Yes |
| `GET` |Get User Info|`/user/:username` <br> <br> replace username e.g. `/user/joshua` | No |
| `PATCH` |Update own-user info<br><br>if user changes password, an OTP is sent|`/user/`  | Yes |



### `POST/PATCH` request body

All the type are String

| Emoji | Meaning | 
|:-:|:-:|
|:heavy_check_mark: | Required |
|:question:| optional|
| :x: | don't include for `PATCH` /ignored elsewhere|

| Path | `fullName` | `username` | `email` | `password` |  `otp`|  `preferredBusStop`<br> e.g. 01234  |  `about` |
|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
`/user/register` | :heavy_check_mark: |:heavy_check_mark: |:heavy_check_mark: |:heavy_check_mark: | :x:| :x: | :x:|
`/user/login`| :x: |:heavy_check_mark: |:x: |:heavy_check_mark: | :x:| :x: | :x:|
`/user/confirmPassword`| :x: |:x: |:x: |:heavy_check_mark: | :heavy_check_mark:| :x: | :x:|
`/user/confirmEmail`| :x: |:x: |:x: |:x: | :heavy_check_mark:| :x: | :x:|
`/user/`| :heavy_check_mark: |:x: |:heavy_check_mark: <br> OTP| :x: |:x:| :heavy_check_mark: | :heavy_check_mark:|
### Response body in data - `GET /user/`

```json
{
	"_id": "651116a5497096ae12395d2b",
	"fullName": "joshua",
	"username": "joshua",
	"email": "jsumarlin.2022@scis.smu.edu.sg",
	"preferredBusStop": "01234",
    "photoURL" : //s3 pre-signed URL - only valid for 15 minutes
}
```
### Special Case - Photos
- please see frontend for help in using axios to send data

| METHOD | Purpose |  Path | Need login |
| :-:| :-:| :-:|:-:|
| `POST` |Set own user photo and delete old one (if any) <br> <br> uses `multipart/form-data` in `name=userPhoto` |`/user`   | Yes |


## B. Item API Endpoints
