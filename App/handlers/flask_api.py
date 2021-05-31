from flask import jsonify, request
from flask_restful import Api, Resource
from pymongo import MongoClient
import handlers.api_tools as tools
import handlers.CONSTANTS as C

# MONGO
client = MongoClient("https://bookit-festcommitten.azurewebsites.net:27017")
db = client.test_db
mock_collection = db["mock_data"]


def db_find_one(key: str, value):
    return mock_collection.find_one({key: value})


def bookit_api(app):
    class NewBooking(Resource):
        def post(self):
            posted_data = request.get_json()
            print("GOT POSTED DATA")
            response = {
                "message": "Something unexpected happened",
                "status": 400
            }
            if tools.validate_request_keys_unordered(posted_data, C.NEW_BOOKING):
                if tools.validate_request_keys_ordered(posted_data, C.NEW_BOOKING):
                    mock_collection.insert(posted_data)
                    response["message"] = "OK"
                    response["status"] = 200
                else:
                    response["message"] = C.REQUEST_KEYS_ORDERED_FALSE
            else:
                response["message"] = C.REQUEST_KEYS_FALSE

            return jsonify(response)

    class AllBookings(Resource):
        def get(self):
            response = {
                "bookings": [],
                "message": "Something unexpected happened",
                "status": 400
            }
            try:
                # all_bookings = json_util.dumps(mock_collection.find())
                all_bookings = list(mock_collection.find())
                # all_bookings_json = json.dumps(all_bookings, default=json_util.default)
                response["bookings"] = all_bookings
                response["message"] = "OK"
                response["status"] = 200
                return response
            except Exception as e:
                response["message"] = e
                return response

    class RemoveBooking(Resource):
        def put(self, id_number: int):
            response = {
                "message": "",
                "status": ""
            }
            _id = tools.str_to_int(id_number)
            if _id:
                if db_find_one("_id", _id):
                    mock_collection.update({"_id": _id}, {"$set": {"company": "", "booker": ""}})
                    response["message"] = C.SLOT_IS_EMPTY
                    response["status"] = 200
                    return response
                else:
                    response["message"] = C.ID_DOES_NOT_EXIST
                    response["status"] = 400
                    return response
            else:
                response["message"] = "'" + C.WRONG_ID_DATATYPE + "' " + C.STR_TO_INT_ERROR
                response["status"] = 400
                return response

    class GetBookings(Resource):
        def get(self, week, room):
            response = {
                "bookings": "",
                "message": "",
                "status": 0
            }
            bookings = list(mock_collection.find({"$and": [{"week": week}, {"room": room}]}))
            if not bookings:
                response["bookings"] = "None"
                response["message"] = C.NO_BOOKINGS_PARAMETERS
                response["status"] = 400
            else:
                response["bookings"] = bookings
                response["message"] = "OK"
                response["status"] = 200
            return response

    api = Api(app)
    api.add_resource(NewBooking, "/v1/new_booking")
    api.add_resource(AllBookings, "/v1/all_bookings")
    api.add_resource(RemoveBooking, "/v1/remove/<id_number>")
    api.add_resource(GetBookings, "/v1/bookings/<int:week>/<string:room>")
