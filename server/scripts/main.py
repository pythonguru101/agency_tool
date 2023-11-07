import json
from instagrapi import Client
import random
import time
import sys 
import requests

class Helpers:
    @staticmethod
    def random_wait(min:int, max:int) -> None:
        time.sleep(random.randint(min, max))
    
    @staticmethod
    def new_print(message:str) -> None:
        print(message)
        sys.stdout.flush()

    @staticmethod
    def return_finished_job(message:str) -> None:
        Helpers.new_print("JOB FINISHED"+str(message))

class InstaBot:
    def __init__(self, username:str=None, password:str=None, proxy: str=None) -> None:
        self.cl = Client()
        self.username = username
        self.password = password
        self.proxy = proxy
        self.url = "https://api.lamadava.com/"
        self.headers = {
            "accept": "application/json",
            "x-access-key":"IBkEXlkWCthMf8n5TSy820Vuyab1DDzE"
        }
        self.initialize() if self.username and self.password and self.proxy else None
        
    def login_secure(self) -> str:
        # Using sessions json
        # get the session from session.json
        session = None
        try: 
            session = self.cl.load_settings(f"sessions/session_{self.username}.json")
        except Exception as e:
            Helpers.new_print(e)
        
        if session:
            Helpers.new_print("Login with session [+]")
        else:
            Helpers.new_print("Login with username and password [+]")
        try:
            self.cl.login(self.username, self.password, relogin=True)
        except Exception as e:
            if session:
                # Means the session is not valid anymore
                # Delete the session and retry
                Helpers.new_print("Session is not valid anymore, retrying again [+]")
                # Delete the session.json file
                old_session = self.cl.get_settings()
                self.cl.set_settings({})
                self.cl.set_uuids(old_session["uuids"])

                self.cl.login(self.username, self.password, relogin=True)
                
        self.cl.dump_settings(f"sessions/session_{self.username}.json")
        
        if self.cl.get_timeline_feed():
            Helpers.new_print("Login successful [+]")
            return True

        Helpers.new_print("Login failed, retrying again [+]")
        return self.login_secure()
        
    def initialize(self) -> None:
        Helpers.new_print("Initializing bot [+]")
        before_ip = self.cl._send_public_request("https://api.ipify.org/")
        self.cl.set_proxy(self.proxy)
        after_ip = self.cl._send_public_request("https://api.ipify.org/")
        Helpers.new_print(f"Before IP: {before_ip} | After IP: {after_ip}")
        self.cl.delay_range = [1, 4]
        self.cl.pre_login_flow()
        self.login_secure()
        self.cl.login_flow()
        
    # Python decorator to print the action that is being executed
    def print_action(func):
        def inner(self, *args, **kwargs):
            Helpers.new_print(f"Executing {func.__name__} [+]")
            return func(self, *args, **kwargs)
        return inner
    
    @print_action
    def get_user_info(self) -> dict:
        user = self.cl.account_info()
        return user
    
    
    @print_action
    def scrape_user_followers(self, username:str, count:int) -> list:
        # Get access to user info, then get followers and then get the first {count} followers if number of count is bigger than the number of followers then return all followers
        user_info = requests.get(self.url + "v1/user/by/username", params={"username": username}, headers=self.headers)
        if "status_code" in user_info and user_info.status_code != 200:
            raise Exception(user_info.json()["detail"])
        user_id = user_info.json()["pk"]

        followers = []
        max_id = None
        while True:
            #res, max_id = self.cl.user_followers_chunk_v1(user_id=user_id, max_id=max_id)
            res, max_id = requests.get(self.url + "v1/user/followers/chunk", params={"user_id": user_id, "amount": count, "max_id": max_id}, headers=self.headers).json()

            if "status_code" in user_info and res.status_code != 200:
                raise Exception(res.json()["detail"])

            followers.extend(res)
            if len(followers) >= count:
                break
            if not max_id:
                break

        #followers = requests.get(self.url + "v1/user/followers/chunk", params={"user_id": user_id, "amount": count}, headers=self.headers).json()[0]
        
        # get the real amount when returning
        leads = {}
        for follower in followers:
            leads.update({follower["username"]: int(follower["pk"])})
            if len(leads) >= count:
                return leads
        return leads
    # Same but for following
    @print_action
    def scrape_user_following(self, username:str, count:int) -> list:
        user_info = requests.get(self.url + "v1/user/by/username", params={"username": username, "amount":count}, headers=self.headers)
        if "status_code" in user_info and user_info.status_code != 200:
            raise Exception(user_info.json()["detail"])
        user_id = user_info.json()["pk"]

        followers = []
        max_id = None

        while True:
            res, max_id = requests.get(self.url + "v1/user/following/chunk", params={"user_id": user_id, "amount": count, "max_id": max_id}, headers=self.headers).json()

            if "status_code" in user_info and res.status_code != 200:
                raise Exception(res.json()["detail"])
            
            followers.extend(res)
            if len(followers) >= count:
                break
            if not max_id:
                break
                
        leads = {}
        for follower in followers:
            leads.update({follower["username"]: int(follower["pk"])})
            if len(leads) >= count:
                return leads
        return leads
    # Scrape by hashtag
    
    @print_action
    def scrape_by_hashtag(self, hashtag: str, count: int) -> dict:
        r = requests.get(self.url + "v1/hashtag/medias/top/chunk", params={"name": hashtag, "max_amount": count}, headers=self.headers)
        #first element of the list
        scrapped_medias = r.json()[0]
        leads = {}
        for media in scrapped_medias:
            leads.update({media["user"]["username"]: int(media["user"]["pk"])})
            if len(leads) >= count:
                return leads
        Helpers.new_print(f"The leads number is {len(leads)}")
            
        # if the leads number ain't enough then we request for similar profiles
        leads_copy = leads.copy()
        for lead in leads_copy.values():
            r = requests.get(self.url + "gql/user/related/profiles", params={"id": lead}, headers=self.headers)
            similar_profiles = r.json()
            for profile in similar_profiles:
                leads.update({profile["username"]: int(profile["pk"])})
                if len(leads) >= count:
                    return leads
            Helpers.new_print(f"The leads number is {len(leads)}")
            
        return leads
    
    @print_action
    def send_dm_username(self, username:str, message:str) -> bool:
        user_info = self.cl.user_info_by_username(username)
        self.cl.direct_send(text=message, user_ids=[user_info.pk])
        return True
    
    
    @print_action
    def send_dm_id(self, id:int, username:str, message:str) -> bool:
        # If the message contains [username] then replace it with the username of the user
        message_to_send = message
        if "[username]" in message:
            # Get the user username
            message_to_send = message.replace("[username]", username)
        # message_to_send = 
        self.cl.direct_send(text=message_to_send, user_ids=[id])
        return f"SENT DM TO USER {username}"
    
    
    @print_action
    def send_dms_ids(self, ids:list, message:str) -> bool:
        self.cl.direct_send(text=message, user_ids=ids)
        return "Sent DMs to the following users: " + ", ".join(map(str, ids))
    
class Main:
    def __init__(self) -> None:
        pass
    
    def run(self) -> None:
        assignment = sys.argv[1]
        # Get three last arguments which are the username, password and proxy
        if assignment == "scrape_followers":
            bot = InstaBot()
            leadUsername = sys.argv[2]
            count = int(sys.argv[3])
            Helpers.return_finished_job(bot.scrape_user_followers(leadUsername, count))
            return
        if assignment == "scrape_following":
            bot = InstaBot()
            leadUsername = sys.argv[2]
            count = int(sys.argv[3])
            Helpers.return_finished_job(bot.scrape_user_following(leadUsername, count))
            return
        if assignment == "scrape_hashtag":
            bot = InstaBot()
            hashtag = sys.argv[2]
            count = int(sys.argv[3])
            Helpers.return_finished_job(bot.scrape_by_hashtag(hashtag, count))
            return 
        
        username = sys.argv[-3]
        password = sys.argv[-2]
        proxy = sys.argv[-1]
        Helpers.new_print(f"Assignment: {assignment} | Username: {username} | Password: {password} | Proxy: {proxy}")
        bot = InstaBot(
            username=username,
            password=password,
            # proxy=InstaBot.create_proxy_url(proxy="gate.smartproxy.com:10000:spg6ppteqj:xq46vlqhOAY7iDn7tt")
            # proxy="http://xtekky:wqefweog_country-gb_streaming-1@geo.iproyal.com:12321"
            proxy="http://user-default:XVIWM27mquqx@resi.proxiware.com:8080"
            #proxy=proxy
        )
        
        if assignment == "send_dm":
            # Leads is a string like this : {"username": id[int], "username2": id2[int]}
            
            leads = sys.argv[2]
            message = sys.argv[3]
            
            leads = json.loads(leads)
            for index, (username, userID) in enumerate(leads.items()):
                Min = min(10, int(2*index*.8))
                Max = min(60, int(6*index*8))
                Helpers.random_wait(Min, Max)
                # Helpers.new_print(f"{username}, {userID}, {message}")
                try:
                    Helpers.new_print(bot.send_dm_id(userID, username, message))
                    Helpers.new_print(f"Sent DM to {username} (Index: {index + 1})")
                except Exception as e:
                    Helpers.new_print(f"Error : {e}")
            Helpers.return_finished_job({"Job":"Finished"})
            
if __name__ == "__main__":
    main = Main()
    main.run()
    # bot = InstaBot(
    #     username="AgencyTool2",
    #     password="getleadssenddms",
    #     proxy="http://WtLrLOwwaonbzupS:wifi;ma;;casablanca-settat;casablanca@proxy.soax.com:9255"
    # )
    # bot = InstaBot()
    
