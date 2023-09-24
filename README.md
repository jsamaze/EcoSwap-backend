# EcoSwap - Backend

Provides core technical functions for the project
- CRUD operations as REST API (MongoDB and Amazon S3 backed)
- Server for Socket Realtime chatting / live view count
- Intermediary for 3rd party API call to protect API Key

## Schema

Used MongoDB - ID and timestamp automatically generated

### User Relation
|field | `fullName` | `username` | `email` | `password` | `photoName` | `preferredBusStop` |
|:------:|:--------:|:--------:|:--------:|:--------:|:--------:|:--------:|
| type| String | String | String | String | String | String
| required | yes | yes | yes | yes | no| no |
| unique | no | yes | yes | no (by theory yes) | yes | no |

**To discuss - how does Wish List and Listed relate**

### Listed Item Relation 

| field | `itemName` | `user` | `description` | `category` | `condition` | `photoName`| `views`| `given_on`|
|:------:|:--------:|:--------:|:--------:|:--------:|:--------:|:-----:|:-----:|:-:|
| type | String | UserId | String | 'Electronics' 'Fashion', 'Furniture' 'Kitchenware' | 'new' 'old'| String array -  maximum 5 | Number | Date
required | yes | yes | no | no | no | no |yes| no|

**none are required to be unique - up to user to not have duplicate listing**

For a view by a user to count, 5 minutes must have elapsed since last viewing

>For example, user see item at 1200hrs and the duration between views is set to 5 minutes. Any view between 1200hrs-1205hrs is not counted. Once a user views at 1205hrs or beyond, their views 5 minutes from that time is not counted

### Wish List Item Relation 

| field | `itemName` | `user` | `description` | `category` | `condition` | `photoName`|`fulfilled_on`|
|:------:|:--------:|:--------:|:--------:|:--------:|:--------:|:-----:|:-----:|
| type | String | UserId | String | 'Electronics' 'Fashion', 'Furniture' 'Kitchenware' | 'new' 'old'| String array -  maximum 5 | Date
required | yes | yes | no | no | no | no | no

none are required to be unique - up to user to not have duplicate listing

### Chat Relation (yet to create)

| field | `seller` | `buyer`| `chats`| `ended_on`| `seller_offers` | `buyer_offers`|
|:------:|:--------:|:--------:|:--------:|:--------:|:--------:|:--------:|
| type | UserID | UserID| array of objects| date | Array of ListedItemID | Array of ListedItemID |
| required | yes | yes | no| no|

### Listed Item <=> User relation

|field|`user`|`ListedItem`|`last_view_time`|
|:-:|:-:|:-:|:-:|
|type | UserID|ListedItemID| last_view_time|
| required | yes | yes | yes|

- time is using `Date.now()`
- refer to Listed Item relation for logic

# REST API Endpoints

:lock: :key: indicates that user need to be authenticated

---
## A. User API Endpoints


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
    "status": "account creation succeed"
}
```

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
---

## B. User Photo API Endpoints

## 1. CREATE/UPDATE Set User Photo :lock: :key:


```API
POST /user/login
```

### Body
```http
Content-Type: multipart/form-data

```

use ```<input type='file' name='userPhoto'>``` 

note to group : please see frontend cropping section for guidance


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

## DELETE - not yet
---
## C. ListedItems - one item

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