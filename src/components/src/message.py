import requests
from bs4 import BeautifulSoup
import time
import csv
import os
import re

# 创建img目录（如果不存在）
os.makedirs('img', exist_ok=True)
# 先收集所有详情页链接
url = "https://www.douban.com/doulist/3936288/?start=50&sort=time&playable=0&sub_type="
header = {
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 SLBrowser/9.0.7.12011 SLBChan/109 SLBVPV/64-b'
}

response = requests.get(url, headers=header)
soup = BeautifulSoup(response.text, 'html.parser')

if response.status_code == 200:
    print('爬取网页地址请求成功')

movie_items = soup.find_all('div', class_='doulist-item')
detail_urls = []

# 收集所有详情页链接
for item in movie_items:
    title_div = item.find('div', class_='title')
    if title_div:
        title_link = title_div.find('a')
        if title_link:
            detail_url = title_link.get('href')
            detail_urls.append(detail_url)
            print("详情页链接:", detail_url)

# 准备CSV文件
csv_file = 'movie_info.csv'
csv_headers = ['电影编号', '电影标题', '导演',  '主演', '类型', '地区',
               '语言', '上映时间', '片长', '剧情简介', '本地图片路径']

with open(csv_file, 'w', newline='', encoding='utf-8-sig') as file:
    writer = csv.writer(file)
    writer.writerow(csv_headers)
    
    # 逐一爬取详情页
    for index, detail_url in enumerate(detail_urls):
        try:
            print(f"正在爬取第{index+1}部电影详情...")
            detail_response = requests.get(detail_url, headers=header)
            
            if detail_response.status_code == 200:
                print('爬取详情网页地址请求成功')
                detail_soup = BeautifulSoup(detail_response.text, 'html.parser')
                
                # 提取电影标题
                title_element = detail_soup.find('span', property='v:itemreviewed')
                title = title_element.text.strip() if title_element else "未知标题"
                print("电影名字:", title)
                
                # 提取其他信息的示例
                # 导演
                director_element = detail_soup.find('a', rel='v:directedBy')
                director = director_element.text.strip() if director_element else ""
            
                # 主演
                actors_elements = detail_soup.find_all('a', rel='v:starring')
                actors_names = [actor.text.strip() for actor in actors_elements] if actors_elements else []
                actors = '/'.join(actors_names)
            
                # 类型
                genres = detail_soup.find_all('span', property='v:genre')
                genre = '/'.join([g.text.strip() for g in genres]) if genres else ""
                
                #地区
                #语言
                language = ""
                area = ""
                all_spans = detail_soup.find_all('span', class_='pl')
                for span in all_spans:
                    if '制片国家/地区:' in span.text or '国家/地区:' in span.text:
                        next_sibling = span.next_sibling
                        if next_sibling:
                            area = next_sibling.strip().replace('\n', '').replace(' ', '')
                    elif '语言:' in span.text:
                        next_sibling = span.next_sibling
                        if next_sibling:
                            language = next_sibling.strip().replace('\n', '').replace(' ', '')
                            break
                
                # 上映日期
                release_date = detail_soup.find('span', property='v:initialReleaseDate')
                release_time = release_date.text.strip() if release_date else ""
                
                # 片长
                runtime = detail_soup.find('span', property='v:runtime')
                running_time = runtime.text.strip() if runtime else ""
                
                # 剧情简介
                summary = detail_soup.find('span', property='v:summary')
                scenario = summary.text.strip() if summary else ""
                # 提取海报图片链接
                poster_img_tag = detail_soup.find('img',rel='v:image')
                if poster_img_tag and poster_img_tag.get('src'):
                    img_url = poster_img_tag['src']
                    
                    # 构造本地文件名（使用电影名称+编号）
                    local_filename = f"img/{index+1}_{title}.jpg"
                    
                    # 下载图片
                    try:
                        img_data = requests.get(img_url, headers=header).content
                        with open(local_filename, 'wb') as handler:
                            handler.write(img_data)
                        print(f"图片已保存为 {local_filename}")
                    except Exception as e:
                        print(f"下载图片失败: {e}")
                        local_filename = ""
                else:
                    local_filename = ""
                
                # 写入CSV
                writer.writerow([
                     index+1, title, director, actors, genre, area,language,
                    release_time, running_time, scenario, local_filename
                ])
                
                print(f"第{index+1}部电影信息已保存")
                
            # 添加延时避免被封
            time.sleep(3)
            
        except Exception as e:
            print(f"爬取第{index+1}部电影时出错: {e}")
            continue

print(f"数据已保存到 {csv_file}")