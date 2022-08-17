#!/usr/bin/env python
# coding: utf-8

# In[1]:


pip install opendatasets --upgrade


# In[3]:


import opendatasets as od
dataset_url = 'https://www.kaggle.com/datasets/sobhanmoosavi/us-accidents' 
od.download(dataset_url)


# In[4]:


import pandas as pd


# In[ ]:


# df = pd.read_csv('US_Accidents_Dec21_updated.csv')


# In[5]:


data_filename = './us-accidents/US_Accidents_Dec21_updated.csv'


# In[6]:


df = pd.read_csv(data_filename)


# In[7]:


df.head(2)


# In[8]:


df.drop('Number', axis=1)


# In[9]:


import folium
import seaborn as sns


# In[10]:


lat_lst =list(df['Start_Lat'])
lng_lst =list(df['Start_Lng'])
lat_lng_lst = list(zip(lat_lst,lng_lst))


# In[11]:


sns.heatmap(lat_lng_lst)


# In[12]:


mapz = folium.Map()


# In[14]:


from folium.plugins import HeatMap


# In[18]:


HeatMap(lat_lng_lst).add_to(mapz)  # plotting heatmap into geographical map


# In[19]:


mapz


# In[26]:


sample_df = df.sample(int(0.0001*len(df))) # To get a sample dataframe 
# As its taking more time to plot when whole data is used


# In[27]:


sample_lat_lst =list(sample_df['Start_Lat'])
sample_lng_lst =list(sample_df['Start_Lng'])
sample_lat_lng_lst = list(zip(sample_lat_lst,sample_lng_lst))


# In[28]:


sample_map = folium.Map()


# In[32]:


points_map = folium.Map()


# In[33]:


for i in sample_lat_lng_lst:
    #print(i)
    marker_i = folium.Marker(i)
    marker_i.add_to(points_map) 


# In[34]:


points_map


# In[ ]:





# In[ ]:





# In[29]:


HeatMap(sample_lat_lng_lst).add_to(sample_map)


# In[30]:


sample_map


# In[ ]:


# lat_lst =list(df['Start_Lat'])
# lng_lst =list(df['Start_Lng'])
# lat_lng_lst = list(zip(lat_lst,lng_lst))     # List of latitude,longitude pair

# import folium   # pip install folium (if not installed already)
# import seaborn as sns
# from folium.plugins import HeatMap # for plotting heatmap

# mapz = folium.Map()    # to create a basic map
# HeatMap(lat_lng_lst).add_to(mapz)  # To plot a heatmap(of geographical points) into map


# points_map = folium.Map() # creating basic map

# for i in sample_lat_lng_lst:    # Loop to mark multiple points in a map
    
#    marker_i = folium.Marker(i)   # marker ==> to mark points in a map
#    marker_i.add_to(points_map) 


# In[35]:


df.columns


# In[50]:


df['City'].value_counts().sort_values(ascending = False).head() # Top 5 accident cities


# In[58]:


df['Temperature(F)'].sort_values()


# In[57]:


df['Temperature(F)'].describe()


# In[65]:


df.groupby(df['Temperature(F)']).count().plot(kind='barh')


# In[ ]:




