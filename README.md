# EcoSwap - Backend

Provides core technical functions for the project
- AJAX CRUD operations as REST API (MongoDB and Amazon S3 backed)
- Server for Socket Realtime chatting
- Intermediary for 3rd party API call to protect API Key


## Schema

Used MongoDB - IDand timestamp automatically generated

### User Relation
|field | `fullName` | `username` | `email` | `password` | `photoName` | `preferredBusStop` |
|:------:|:--------:|:--------:|:--------:|:--------:|:--------:|:--------:|
| type| String | String | String | String | String | String
| required | yes | yes | yes | yes | no| no |
| unique | no | yes | yes | no (by theory yes) | yes | no |

### Wish List Item Relation (same as Listed Item for now)

| field | `itemName` | `user` | `description` | `category` | `condition` | `photoName`|
|:------:|:--------:|:--------:|:--------:|:--------:|:--------:|:-----:|
| type | String | UserId | String | ['Electronics', 'Fashion', 'Furniture', 'Kitchenware'] | ['new','old']| String maximum 5
required | yes | yes | no | no | no

none are required to be unique - up to user to not have duplicate listing

### Chat Relation (yet to create)

| field | `seller` | `buyer`| `chats`|
|:------:|:--------:|:--------:|:--------:|
| type | UserID | UserID| array of objects|
| required | yes | yes | no|



# API Endpoints

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

## 4. CREATE/UPDATE Set User Photo :lock: :key:


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

## 6. READ - Fetch User Photo

```api 
GET /user/photo/:username
```
:arrow_up:  replace :username with username whose photo you want to see

### Response

```json
{ 
    "status": "success",
   "url" : //this is S3 pre-signed url - only valid for 15 minutes
}
```

## DELETE - not yet
---
## B. WishListItems

## 1. CREATE 

## 2. UPDATE

## 3. READ

## 4. DELETE

---