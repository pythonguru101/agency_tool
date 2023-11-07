from instagrapi import Client
import random
import time

# Best Practice: Use a Proxy
# Replace '<api_key>' with your SOAX proxy API key
proxy_url = "http://user-default_geo-us:w9cKuKYrPd5N@mbl.proxiware.com:8080"

# Best Practice: Add Delays
# Set the delay range for requests (in seconds)
delay_range = [1, 3]

def add_random_delay():
    delay = random.uniform(delay_range[0], delay_range[1])
    time.sleep(delay)

def login_with_session(USERNAME, PASSWORD):
    cl = Client()
    
    # Best Practice: Use a Proxy
    cl.set_proxy(proxy_url)
    # Best Practice: Use Sessions
    try:
        cl.load_settings("session.json")
        cl.get_timeline_feed()  # Check if the session is valid
    except Exception:
        cl.login(USERNAME, PASSWORD)
        cl.dump_settings("session.json")

    return cl

def check_connection(client):
    try:
        user_info = client.user_info_by_username("redobsi_off")
        Client.user_followers(user_info.id)
        return True
    except Exception as e:
        print(f"Error: {e}")
        return False

def main(): 
    USERNAME = "redobsi_off"
    PASSWORD = "yaya2007`<hey>`"
    # Login with session and create a client object
    client = login_with_session(USERNAME, PASSWORD)

    # Check if connected to Instagram
    if check_connection(client):
        # Example usage: Get timeline feed and add delays between requests
        for _ in range(10):  # Replace 10 with the number of requests you want to make
            try:
                timeline_feed = client.get_timeline_feed()
                print("Successfully fetched timeline feed.")
            except Exception as e:
                print(f"Error: {e}")

            add_random_delay()

def main_alternative():
    sessionid = "53181489086%3AaWKWUhS8dPELIE%3A6%3AAYehe1yN4tGxkDJLirSgscrMRtc5kxhpmWoIvfDN4Q"
    cl = Client()
    # login by session id
    cl.set_proxy(proxy_url)
    cl.login_by_sessionid(sessionid)
    user_info = cl.user_info_by_username("m__ghali__m.pv")
    print(user_info.follower_count)
    print(user_info)

def get_session_id():
    import re
    import requests

    from datetime import datetime

    link = 'https://www.instagram.com/accounts/login/'
    login_url = 'https://www.instagram.com/accounts/login/ajax/'

    time = int(datetime.now().timestamp())

    payload = {
        'username': '<USERNAME HERE>',
        'enc_password': f'#PWD_INSTAGRAM_BROWSER:0:{time}:<PASSWORD HERE>',
        'queryParams': {},
        'optIntoOneTap': 'false'
    }

    with requests.Session() as s:
        r = s.get(link)
        csrf = re.findall(r"csrf_token\":\"(.*?)\"",r.text)[0]
        r = s.post(login_url,data=payload,headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36",
            "X-Requested-With": "XMLHttpRequest",
            "Referer": "https://www.instagram.com/accounts/login/",
            "x-csrftoken":csrf
        })
        print(r.status_code)
        # print(r.url)
        # print(r.text)

        # print(s.cookies)

if __name__ == "__main__":
    # main()
    main_alternative()
    # print(get_session_id())
