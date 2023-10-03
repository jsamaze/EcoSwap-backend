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
`POST /item` | :heavy_check_mark: <br> ***by query e.g. `type: Listed`***|:heavy_check_mark: |:x: <br> automatic|:heavy_check_mark: | :heavy_check_mark:| :heavy_check_mark:| :heavy_check_mark:|
`PATCH /item/:id`| :x:|:heavy_check_mark: |:x: |:heavy_check_mark: | :heavy_check_mark:| :heavy_check_mark:| :heavy_check_mark:|
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

| METHOD | Purpose |  Path | Need login | Can Have *(not must)* Query|
| :-:| :-:| :-:|:-:|:-:|
| `GET` |Perform a search on all items |`/items/search/:search?` <br> search text can be given or not  | Yes | Yes|
| `GET` |Sort items by popularity (views)|`/items/popular`   | Yes (for all results) <br> No (max 10) | No|

#### Parameters/Query to add for `items/search/`

| parameter name | Type | 
|:-:|:-:|
|'tags'| Array of strings|
|'category'|  `Electronics`/`Fashion`/ `Furniture`/`Kitchenware` |
|'condition'| `old`/`new`|
|"itemType"| `Listed`/`WishList` <br> defaults to `Listed` |
| "username"| String|

## C. Chat API Endpoints

> Important! Socket details are not included

#### About the chat as a whole

| METHOD | Purpose |  Path | Need login | Need Query|
| :-:| :-:| :-:|:-:|:-:|
| `GET` | Fetch chat between logged in user and specific user |`/chat/user/:username` <br> replace `:username` with username  | Yes | No|
| `GET` |Fetch all chats along with the most recent chat |`/chat`  | Yes | No |
| `POST` |Create a new chat with someone <br> i.e offer swaps with one of their item <br> if user is connected by socket, they will be notified|`/chat/user/:username` <br> replace `:username` with username | Yes | No|
| `DELETE` |Delete a chat with someone <br> if user is connected by socket, they will be notified |`/chat/user/:username` <br> replace `:username` with username | Yes | No|
| `PATCH` |Close a chat with someone successfully <br> need both party to agree |`/chat/user/:username` <br> replace `:username` with username | Yes | Yes <br> **to reject specify reject=True**|

### `GET /chat/user/:username` Request Sample

```json
{
		"_id": "651a8a6af59290d118620cb8",
		"messages": [
			{
				"sender": "buyer",
				"textContent": "kk",
				"_id": "651ac80298e56021d1b7fd28",
				"createdAt": "2023-10-02T13:39:14.884Z",
				"updatedAt": "2023-10-02T13:39:14.884Z"
			},
			{
				"sender": "buyer",
				"textContent": "jok",
				"_id": "651aeca8e6c426aea46aad18",
				"createdAt": "2023-10-02T16:15:36.020Z",
				"updatedAt": "2023-10-02T16:15:36.020Z"
			}
		],
		"createdAt": "2023-10-02T09:16:26.158Z",
		"updatedAt": "2023-10-02T16:15:36.021Z",
		"seller": {
			"_id": "651116a5497096ae12395d2b",
			"fullName": "lol",
			"username": "joshua"
		},
		"buyer": {
			"_id": "651a7f302d9d56d56c95fee0",
			"fullName": "sarah",
			"username": "sarah"
		},
		"sellerItems": [
			{
				"_id": "651469fac50150df08c24ed1",
				"itemName": "Awesome Wooden Bike",
				"category": "Fashion",
				"condition": "old"
			}
		],
		"buyerItems": [
			{
				"_id": "651aa19bb4bb20456b7d587d",
				"itemName": "Gorgeous Steel Pants",
				"category": "Kitchenware",
				"condition": "new"
			}
		]
	}
```

### `GET /chat` Request sample

```json
 [
  {
  	"_id": "651a8a6af59290d118620cb8",
  	"createdAt": "2023-10-02T09:16:26.158Z",
  	"updatedAt": "2023-10-02T16:15:36.021Z",
  	"latestMessage": {
  		"sender": "buyer",
  		"textContent": "hei",
  		"createdAt": "2023-10-02T16:15:36.020Z"
  	},
  	"seller": {
  		"fullName": "lol",
  		"username": "joshua"
  	},
  	"buyer": {
  		"fullName": "sarah",
  		"username": "sarah"
  	}
  },
  {
  	"_id": "651a8c6df59290d118620d68",
  	"createdAt": "2023-10-02T09:25:01.070Z",
  	"updatedAt": "2023-10-02T17:27:59.856Z",
  	"latestMessage": {
  		"sender": "seller",
  		"textContent": "is this avail",
  		"createdAt": "2023-10-02T17:27:59.856Z"
  	},
  	"seller": {
  		"fullName": "jakob",
  		"username": "jakob"
  	},
  	"buyer": {
  		"fullName": "sarah",
  		"username": "sarah"
  	}
  }
  ]
```
---
#### About the components of chat - deprecated please refer to socket implementation

| METHOD | Purpose |  Path | Need login | Need Query|
| :-:| :-:| :-:|:-:|:-:|
| `POST` |Send a new message <br> Only supports text now|`/chat/user/:username/message` <br> replace `:username` with username  | Yes | No|
| `POST` |Set a new item willing to trade list |`/chat/user/:username/item` <br> replace `:username` with username   | Yes | No|
| `DELETE` |Remove an item from willing to trade list |`/chat/user/:username/item/:itemId` <br> replace `:username` with username and  `itemId` with `_id` of item  | Yes | No|

> `POST` and `DELETE` endpoints will be implemented in socket

### `POST` request body


| Emoji | Meaning | 
|:-:|:-:|
|:heavy_check_mark: | Required |
|:question:| optional|
| :x: | don't include for `PATCH` (will cause error) /ignored elsewhere|

> Only text message is supported <br> picture can be supported but will take time

Data type for all is string

| Field :arrow_right: | `itemId` | `textContent`  | 
|:-:|:-:|:-:|
`POST /chat/user/:username` | :heavy_check_mark:|:heavy_check_mark: |
`POST /chat/user/:username/item`| :x:|:heavy_check_mark: |

