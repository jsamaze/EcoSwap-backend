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
        "data" : //if it is a GET request

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
- all `POST` need a body while `PATCH` body is optional

| METHOD | Purpose |  Path | Need login |
| :-:| :-:| :-:|:-:|
| `POST` |Register - auto send OTP|`/user/register`   | No |
| `POST` |Login|`/user/login`  | No |
| `GET` |Logout|`/user/logout`  | Yes |
| `GET` |generate OTP for email verification or change password|`/user/generateOTP` | No <br><br> *If not logged in, need to pass username through query* |
| `POST` |*OTP required* - change password  |`/user/confirmPassword` | Yes |
| `POST` |*OTP required* - confirm already registered email  |`/user/confirmEmail` | Yes |
| `GET` |Get User Info|`/user/:username` <br> <br> replace username e.g. `/user/joshua` | No |
| `PATCH` |Update logged in user info<br><br>if user changes password, an OTP is sent|`/user/`  | Yes |



### `POST/PATCH` request body

All the type are String

| Emoji | Meaning | 
|:-:|:-:|
|:heavy_check_mark: | Required |
|:question:| optional|
| :x: | don't include for `PATCH` /ignored elsewhere|

| Field :arrow_right: | `fullName` | `username` <br> Max Length 5 <br> Must be unique | `email` <br> Must be unique| `password` |  `otp`|  `preferredBusStop`<br> e.g. 01234  |  `about` |
|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
`/user/register` | :heavy_check_mark: |:heavy_check_mark: |:heavy_check_mark: |:heavy_check_mark: | :x:| :x: | :x:|
`/user/login`| :x: |:heavy_check_mark: |:x: |:heavy_check_mark: | :x:| :x: | :x:|
`/user/confirmPassword`| :x: |:x: |:x: |:heavy_check_mark: | :heavy_check_mark:| :x: | :x:|
`/user/confirmEmail`| :x: |:x: |:x: |:x: | :heavy_check_mark:| :x: | :x:|
`PATCH /user/`| :heavy_check_mark: |:x: |:heavy_check_mark: <br> OTP| :x: |:x:| :heavy_check_mark: | :heavy_check_mark:|
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

### Those applicable to only one items

| METHOD | Purpose |  Path | Need login | Need Query|
| :-:| :-:| :-:|:-:|:-:|
| `POST` | Create a new item|`/item`   | Yes | Yes|
| `GET` |Fetch an item based on its id|`/item/:id` <br> replace `:id` with `objectId` | No | No |
| `DELETE` |Delete Item <br> Only applicable to logged user's item|`/item/:id` <br> replace `:id` with `objectId`  | Yes | No|
| `PATCH` |Update Item <br> Only applicable to logged user's item|`/item/:id` <br> replace `:id` with `objectId` | Yes | No|

### `POST/PATCH` request body/query


| Emoji | Meaning | 
|:-:|:-:|
|:heavy_check_mark: | Required |
|:question:| optional|
| :x: | don't include for `PATCH` (will cause error) /ignored elsewhere|

> The listings do not need to be unique. It is up to user to not make duplicate listing

| Field :arrow_right: | `itemType` | `itemName`  | `user` | `description` |  `category`|  `condition`  |  `tags` |
|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| Data type | `WishList`/`Listed` | String | `ObjectId` referencing user | String | `Electronics`/`Fashion`/ `Furniture`/`Kitchenware` | `old`/`new` | `Array` of `String`
`POST /user/register` | :heavy_check_mark: <br> ***by query***|:heavy_check_mark: |:x: <br> automatic|:heavy_check_mark: | :heavy_check_mark:| :heavy_check_mark:| :heavy_check_mark:|
`PATCH /user/login`| :x:|:heavy_check_mark: |:x: |:heavy_check_mark: | :heavy_check_mark:| :heavy_check_mark:| :heavy_check_mark:|
### Response body in data - `GET /item/:id`

```json
{
  "_id": "651469d9c50150df08c24ebb",
  "itemType": "WishList",
  "itemName": "Tasty Wooden Chicken",
  "user": {
  	"_id": "651116a5497096ae12395d2b",
  	"username": "joshua",
  	"preferredBusStop": "90898"
  },
  "description": "New range of formal shirts are designed keeping you in mind. With fits and styling that will make you stand apart",
  "category": "Electronics",
  "condition": "new",
  "tags": [
  	"Sleek",
  	"Modern",
  	"Tasty",
  	"Oriental"
  ],
  "views": 1,
  "createdAt": "2023-09-27T17:43:53.571Z",
  "updatedAt": "2023-09-27T17:50:39.447Z",
  "photoURL": [
  	"url1","url2",...
  ]
}
```

### Special Case - Photos for one item (max 5 per item)
- please see frontend for help in using axios to send data
- no query for all

| METHOD | Purpose |  Path | Need login | 
| :-:| :-:| :-:|:-:|
| `POST` |Add one more photo to the item photos <br> Only applicable to logged user's item|`/item/:id/photo`   | Yes | 
| `DELETE` |Delete photo to the item photos <br> Only applicable to logged user's item|`/item/:id/photo`   | Yes |

### those applicable to more than one (listed items)

## C. Chat API Endpoints