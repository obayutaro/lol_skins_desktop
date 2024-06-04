from flask import Flask, render_template, url_for
import requests


app = Flask(__name__)

def get_version():
    url = "https://ddragon.leagueoflegends.com/api/versions.json"
    response = requests.get(url)
    ver = response.json()
    return ver[0]

def get_champ_data(ver):
    url = f"https://ddragon.leagueoflegends.com/cdn/{ver}/data/en_US/champion.json"
    response = requests.get(url)
    champion_data = response.json()
    champions = champion_data['data']
    champion_list = sorted([(champion['key'], champion['id'], champion['name']) for champion in champions.values()], key=lambda x: x[2])
    return champion_list

def get_skin_data(ver, champion_id):
    url = f"https://ddragon.leagueoflegends.com/cdn/{ver}/data/en_US/champion/{champion_id}.json"
    response = requests.get(url)
    champion_details = response.json()
    return champion_details['data'][champion_id]['skins']

def get_owned_skins():
    from league_client.inventory import get_owned_skins
    from league_connection import LeagueConnection
    import os
    league_lockfile = 'C:\\Riot Games\\League of Legends\\lockfile'
    
    if not os.path.exists(league_lockfile):
        raise FileNotFoundError("League of Legendsクライアントが起動していません。")
    
    connection = LeagueConnection(league_lockfile)
    inventory = get_owned_skins(connection, True)
    return [str(skin_id) for skin_id in inventory]  # IDを文字列に変換して比較を確実にする

@app.route('/')
def index():
    version = get_version()
    champions = get_champ_data(version)
    return render_template('index.html', champions=champions)

@app.route('/champion/<champion_id>/<champion_key>')
def champion(champion_id, champion_key):
    version = get_version()
    skins = get_skin_data(version, champion_id)
    try:
        owned_skins = get_owned_skins()  # IDのリストを返す
        owned_skins.append(champion_key+"000")
    except FileNotFoundError:
        return render_template('error.html', message="League of Legendsクライアントが起動していません。クライアントを起動してください。")
    return render_template('champion.html', champion_id=champion_id, champion_key=champion_key, skins=skins, owned_skins=owned_skins)

if __name__ == "__main__":
    app.run(host="0.0.0.0",debug=False)
