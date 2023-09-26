# EcoSwap - Backend

## To-do
- [X] Complete ListedItem API
- [ ] Complete ListedItem Pictures API
  
__easy just repeat__
- [ ] Complete WishList API (single)
- [ ] Complete WishList Pictures API

__create js webpage__
- [ ] Fake data up

__use atlas search__
- [ ] Complete ListedItem Search

__use radius search__
- [ ] Complete algorithm

## Pending
- [ ] Set up cron job

---
Provides core technical functions for the project
- CRUD operations as REST API (MongoDB and Amazon S3 backed)
- Server for Socket Realtime chatting / live view count
- Intermediary for 3rd party API call to protect API Key

## Schema

Used MongoDB - ID and timestamp automatically generated

### User Relation
|field | `fullName` | `username` | `email` | `password` | `photoName` | `preferredBusStop` |`about`|  `emailVerified`|
|:------:|:--------:|:--------:|:--------:|:--------:|:--------:|:--------:|:-:|:-:|
| type| String | String | String | String | String | String |String | Boolean |
| required | yes | yes | yes | yes | no| no | no | yes| 
| unique | no | yes | yes | no (by theory yes) | yes | no | no| yes|

**To discuss - how does Wish List and Listed relate**

### Listed Item Relation 

| field | `itemName` | `user` | `description` | `category` | `condition` | `photoName`| `views`| `tags`| ~~`given_on`~~|
|:------:|:--------:|:--------:|:--------:|:--------:|:--------:|:-----:|:-----:|:-:|:-:|
| type | String | UserId | String | 'Electronics' 'Fashion', 'Furniture' 'Kitchenware' | 'new' 'old'| String array -  maximum 5 | Number | String array | Date
required | yes | yes | no | yes | yes | no |yes| no| no

**none are required to be unique - up to user to not have duplicate listing**

note the last column is now part of an inherited schema

---

For a view by a user to count, 5 minutes must have elapsed since last viewing

>For example, user see item at 1200hrs and the duration between views is set to 5 minutes. Any view between 1200hrs-1205hrs is not counted. Once a user views at 1205hrs or beyond, their views 5 minutes from that time is not counted
---

### Wish List Item Relation 

| field | `itemName` | `user` | `description` | `category` | `condition` | `tags`|`photoName`|~~`fulfilled_on`~~|
|:------:|:--------:|:--------:|:--------:|:--------:|:--------:|:-----:|:-----:|:-:|
| type | String | UserId | String | 'Electronics' 'Fashion', 'Furniture' 'Kitchenware' |  'new' 'old'| String array|String array -  maximum 5 | Date |
required | yes | yes | no | no | no | no | no|no |

note the last column is now part of an inherited schema

none are required to be unique - up to user to not have duplicate listing

### Chat Relation (yet to create)

| field | `seller` | `buyer`| `chats`| `ended_on`| `seller_offers` | `buyer_offers`|
|:------:|:--------:|:--------:|:--------:|:--------:|:--------:|:--------:|
| type | UserID | UserID| array of objects| date | Array of ListedItemID | Array of ListedItemID |
| required | yes | yes | no| no|

### Views relation

|field|`user`|`item`|`lastSeen`|
|:-:|:-:|:-:|:-:|
|type | UserID|ListedItemID| last_view_time|
| required | yes | yes | yes|

- time is using `Date.now()`
- refer to Listed Item relation for logic

# REST API Endpoints

:lock: :key: indicates that user need to be authenticated

---
## A. User API Endpoints

Note to Joshua : implement OTP

## 1. CREATE - Register

```API
POST /user/register
```

### Request body

|  Attribute  |  Type  | Required | Description |
| :---------: | :----: | :------: | :---------: |
| `fullName` | String |   Yes    | -  |
| `username`  | String |    Yes    |  limit 20 characters  |
|   `email`   | String |   Yes    |    validated    |
| `password`  | String |   Yes    |  plaintext   |

//Please send unhashed password. Backend handles hashing

```json
{
  "fullName": "joshua",
  "username": "joshua",
  "email": "mainuser@lol.com",
  "password": "joshua"
}
```

### Response - 200 Success

```json
{ 
    "status": "please confirm email - account creation succeed"
}
```
*The user will receive an email with 6 digit OTP*

### Response - 500 Internal Server Error (MongoDB issue)

```json
{ 
    "status": "account creation failed",
   "problem" : //message inside exception
}
```

## 2. Login

```API
POST /user/login
```

### Request body

|  Attribute  |  Type  | Required | Description |
| :---------: | :----: | :------: | :---------: |
| `username`  | String |    Yes    |  -  |
| `password`  | String |   Yes    |  plaintext   |

//Please send unhashed password. Backend handles hashing

```json
{
  "username": "joshua",
  "password": "joshua"
}
```

### Response - 200 Success

```json
{ 
    "status": "Success" 
}
```

Cookie will be sent to maintain session

### Response - 401 Unauthorised

```json
{ 
    "status": "unable to authenticate",
}
```


### Response - 500 Internal Server Error

```json
{ 
    "status": "failed retrieving user",
   "problem" : //message inside exception
}
```

## 3. Logout :lock: :key:

```API
POST /user/login
```

### Body
No body

### Response - 200 Success

```json
{ 
    "status": "Success" 
}
```

### Response - 500 Internal Server Error

```json
{ 
    "status": "Failed",
   "problem" : //message inside exception
}
```

## 4. Generate OTP :lock: :key:
**IMPORTANT** - OTP can be used to either verify email/change password
```API 
GET /user/generateOTP/
```
### Response - 200 OK
```json
{ 
    "status" : "success - please check email"
}
```
## 5. Confirm Email OTP :lock: :key:

```API
POST /user/confirmEmail
```

|  Attribute  |  Type  | Required | Description |
| :---------: | :----: | :------: | :---------: |
| `otp`  | number |    Yes    |  -  |
|
### Body

```API
{
    "otp":123456
}
```
### Response - 200 OK
```json
{ 
    "status" : "success"
}
```
### Response - 401 Unauthenticated
```json
{ 
    "status" : "unable to verify OTP"
}
```
### Response - 500 Internal server error
```json
{
    "status" : "unable to find user"
}
 ```

## 7. Confirm change password OTP :lock: :key:

```API
POST /user/confirmPassword
```
### Body
|  Attribute  |  Type  | Required | Description |
| :---------: | :----: | :------: | :---------: |
| `otp`  | number |    Yes    |  -  |
| `password`  | String |    Yes    |  -  |

```json
{
    "otp":123456,
    "password":"abcd"
}
```
### Response - 200 OK
```json
{ 
    "status" : "success"
}
```
### Response - 401 Unauthenticated
```json
{ 
    "status" : "unable to verify OTP"
}
```
### Response - 500 Internal server error
```json
{
    "status" : "unable to find user"
}
 ```

## 8. User Info
```api
POST /user/:userid
```
:up: replace  `:userid` with userID
### Response - 200 OK
```json
{
	"_id": "651116a5497096ae12395d2b",
	"fullName": "joshua",
	"username": "joshua",
	"email": "jsumarlin.2022@scis.smu.edu.sg",
	"preferredBusStop": "01234"
}
```

## 9.User Info update :lock: :key:
```HTTP 
PATCH /user/
```
You can only update info about yourself
### Body
|  Attribute  |  Type  | Required | Description |
| :---------: | :----: | :------: | :---------: |
| `fulName`  | String |    No    |  -  |
| `preferredBusStop`  | String |    No    |  -  |
| `about`  | String |    No    |  -  |
| `email` | String | No| Will require OTP validation |

```json
{
    "fullName" : "Joshua S",
    "preferredBusStop" :"03456",
    "about" : ""
}
```
### Response 200 OK
```json
{
    "status":"update successful - please verify email"
}
```

### Response 400 Bad Request
```json
{
    "status":"username cannot be set in User"
}
```

### Response 400 Bad Request
```json
{
    "status":"Invalid input",
    "problem" : //mongoDB validation error
}
```

### Response 500 Internal Server Error
```json
{
    "status":"failed updating user"
}
```


## B. User Photo API Endpoints

## 1. CREATE/UPDATE Set User Photo :lock: :key:


```API
POST /user/photo
```

### Body
```http
Content-Type: multipart/form-data
```

use ```<input type='file' name='userPhoto'>``` 

***note to group : please see frontend cropping section for guidance***


### Response - 200 Success

```json
{ 
    "status": "success in updating photo",
    "filename" :  //filename as it is stored in database
}
```

### Response - 500 Internal Server Error
May Indicate failure to upload 

The following indicate failure to update database
```json
{ 
    "status": "error with database update, photo not deleted from database",
   "problem1" :, //error with MongoDb
   "problem2" :, //error with photo download
}
```

```json
{ 
    "status": "error with database update, photo deleted from database",
   "problem" :, //error with MongoDb
}
```

## 2. READ - Fetch User Photo

```api 
GET /user/photo/:username
```
:arrow_up:  replace :username with username whose photo you want to see

### Response

```json
{ 
    "status": "success",
   "url" : //this is an S3 pre-signed url - only valid for 15 minutes
}
```


## C. ListedItems - one item


## 1a. CREATE :lock: :key:
```http 
POST /listedItem/
```

### Body
|  Attribute  |  Type  | Required | Description |
| :---------: | :----: | :------: | :---------: |
| `itemName`  | String |    Yes    |  Don't need to be unique  |
| `description`  | String |    No    |  -  |
| `category`  | String |    Yes    |  -  |
| `condition` | String | Yes|  |
| `tags` | Array of Strings | No | - |


```json
{
    "itemName" : "Microwave oven",
    "description" : "Pre-used oven",
    "category" : "Electronics",
    "condition" : "old",
    "tags": ["Sony", "popcorn", "white"],
}
```

## 1b. CREATE - add picture :lock: :key:
```http 
POST /listedItem/photo/:itemid
```

## 2. UPDATE  :lock: :key:
```api 
UPDATE /listedItem/:itemid
```
|  Attribute  |  Type  | Required | Description |
| :---------: | :----: | :------: | :---------: |
| `itemName`  | String |    Yes    |  Don't need to be unique  |
| `description`  | String |    No    |  -  |
| `category`  | String |    Yes    |  -  |
| `condition` | String | Yes|  - |
| `tags` | Array of Strings| If a string consider array of length 1 | No | - |

```json
{
    "itemName" : "Microwave oven",
    "description" : "Pre-used oven",
    "category" : "Electronics",
    "condition" : "old",
    "tags": ["Sony", "popcorn", "white"],
}
```
## 3. READ  :lock: :key: - limited for non-auth
```api 
GET /listedItem/:itemid
```


```json
{
    "status" : "success",
    "data": {
                "itemName" : "Microwave oven",
                "user" : {

                }
                "description" : "Pre-used oven",
                "category" : "Electronics",
                "condition" : "old",
                "tags": ["Sony", "popcorn", "white"],
                "photoUrl" : ["url1","url2",...]
            }
}
```

***Important*** - counts the number of user that sees it
## 4. DELETE  :lock: :key: 
```api 
DELETE /listedItem/:itemid
```
## D. Listed Items - many items

## 1. See trending items
```http 
GET /listedItem/trending/
```

## 2. Search some items
```http 
GET /listedItem/search?
```
to decide on queries
- by user
- by category
- by tags

## E. Wish List Item - one item

## 1. CREATE :lock: :key:
```http 
POST /listedItem/:itemid
```
## 2. UPDATE  :lock: :key:
```api 
UPDATE /listedItem/:itemid
```
## 3. READ  :lock: :key: - limited for non-auth
```api 
GET /listedItem/:itemid
```
## 4. DELETE  :lock: :key: 
```api 
DELETE /listedItem/:itemid
```

## F. Wish List Item - many items

```http 
GET /listedItem/search?
```
to decide on queries
- by user
- by category
- by tags

## G. Chat 

```http 
GET /user/chat/
```
Retrieve all with latest message

```http
GET /user/chat/:user_id
```

# Socket.io 

## View Count
```javascript
    const socket = io("https://example.com/views");


    socket.on("view-increase",() => {
        //view logic
    })  //meaning the number of views increased by 1
```

```javascript
    io.of("\views").to(objectID).emit("view-increase")
```

## Chat
```javascript
    const socket = io("https://example.com/chat");
```

## A. Client send message
## B. Client receive message
---
## C. Client tick item
## D. Client receive that item ticked
--- 
## E. client ends convo