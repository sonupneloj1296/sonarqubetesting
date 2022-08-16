#!/usr/bin/env python
# coding: utf-8

# In[1]:


import pandas as pd


# In[2]:


df = pd.read_csv('US_Accidents_Dec21_updated.csv')


# In[3]:


len(df.columns) # No:of columns


# In[4]:


len(df) # No:of rows


# In[5]:


df.info()


# In[6]:


df.describe() # Statistics of numerical columns and if obj col selected no:of times appeared like details can be observed


# In[7]:


num_df = df.select_dtypes(exclude = ['O','bool']) # df with numerical columns
obj_df = df.select_dtypes(include = 'O')


# In[8]:


len(num_df.columns) # no:of numerical columns


# In[9]:


# Null/missing values
df.isna().sum()


# In[10]:


# Percentage of missing values
null_percent = (df.isna().sum().sort_values(ascending = False)/len(df))*100
null_percent # Percentage of null values in descending order


# In[11]:


type(null_percent)  # Type of variable 'null_percent'


# In[12]:


null_percent.plot(kind='barh') # As entries with zero doesnt make any sense in the graph, filter it out


# In[13]:


# Filtering out all columns with null percentages which are not equal to zero
nonz_null = null_percent[null_percent!=0]
nonz_null


# In[14]:


nonz_null.plot(kind='barh')


# In[15]:


# If more than half of the data is missing, then probabily that column wont be relevant
# Therefore, remove Number column

df.drop('Number', axis=1)


# # EDA and Visualization
# 
# City
# 
# Start_Time
# 
# Start_Lat, Start_Lng
# 
# Temperature
# 
# Weather Condition
# 
# Doesnt contain data about New York

# ### Questions
# 
# 1.Which 5 states has highest no:of accidents?
# 
# 2.Where are more accidents observed, warmer or colder place? How about per capita?
# 
# 3.Does New York show up in the data? If yes, why is the count lower when it is the most populated city?
# 
# 4.Among the top 100 cities in no:of accidents, which state is more frequent?
# 
# 5.At what time does most no:of accidents occur?
# 
# 6.Which day of the week does most no:of accidents occur?
# 
# 7.Which month has most no:of accidents reported?
# 
# 8.What's the trend of the accidents(increasing/decreasing)?
# 
# 

# ## City

# In[16]:


cities = df['City'].unique() # Returns a list of unique cities
cities


# In[17]:


df['City'].nunique()


# In[18]:


len(cities)


# In[19]:


df['City'].value_counts()  # Count(no of) each city


# In[20]:


'New York' in df['City']  # To check whether 'New York' is in 'City' column


# In[21]:


'New York' in df['State'] 


# In[22]:


'NY' in df['State'] 


# In[23]:


accident_cities = df['City'].value_counts().sort_values(ascending=False)
accident_cities


# In[24]:


import seaborn as sns


# In[25]:


sns.distplot(accident_cities) # from the plot, most cities has less than 2000 accidents


# In[26]:


df['City'].value_counts().sort_values(ascending=False)[:20].plot(kind='barh') # top 20 cities plotted


# In[27]:


import seaborn as sns
sns.set_style('darkgrid')


# In[28]:


type(df['City'])


# In[29]:


high_accident_cities = accident_cities[accident_cities >= 1000]  
# high_accident_cities are cities with more than 1000 or 1000 accidents occur


# In[30]:


low_accident_cities = accident_cities[accident_cities < 1000] 
# low_accident_cities are cities with less than 1000 accidents occur


# In[31]:


len(high_accident_cities) # No:of cities with higher no:of acidents 


# In[32]:


len(low_accident_cities) # No:of cities with lower no:of acidents


# In[33]:


percent_high_accident_cities = (len(high_accident_cities)/len(accident_cities))*100
percent_high_accident_cities  


# In[34]:


sns.distplot(high_accident_cities)


# In[35]:


sns.distplot(low_accident_cities)


# In[36]:


# Both high_accident_cities and low_accident_cities follows a decreasing exponential distribution


# In[ ]:





# In[ ]:





# ***Log_scale***
# 
# Logarithms can quickly tell us whether the rate of change of something is increasing (like a car speeding up), staying constant, or decreasing (gradually stepping on the brake)

# In[37]:


sns.histplot(high_accident_cities, log_scale=True) # As exponential decreasing plot looks similar, better to use log scale


# In[38]:


accident_cities[accident_cities==1] # Cities with only 1 accident


# In[39]:


accident_cities[accident_cities==1].sum() # No:of cities with only 1 accident


# In[40]:


(len(accident_cities[accident_cities==1])/len(accident_cities))*100 

# 9.5% of cities has reported only 1 accident


# In[ ]:





# In[ ]:





# ## Start time

# In[41]:


df['Start_Time']  # Start_Time column consists of date and time 


# In[42]:


df['Start_Time'][0] # 1st row in Start_Time column


# In[43]:


type(df['Start_Time'][0]) # Date and time in the column Start_Time is in string format


# In[44]:


# Overwrite the column 'Start_Time' with the date and time converted into datetimestamp

df['Start_Time'] = pd.to_datetime(df['Start_Time'])


# In[45]:


type(df['Start_Time'][0]) # datatype changed from string to timestamp


# In[46]:


df['Start_Time']


# In[47]:


# To obtain hour from timestamp(for a single value in a column)

df['Start_Time'][5].hour


# In[48]:


# To obtain hour from timestamp(for a whole column/Series)

df['Start_Time'].dt.hour


# In[49]:


sns.histplot(df['Start_Time'].dt.hour)


# In[50]:


sns.distplot(df['Start_Time'].dt.hour,bins=24,kde=False,norm_hist=True) # y axis in percents

# hour vs no:of accidents


# most accidents happen in the evening, ext highest is in the morning


# In[51]:


df['Start_Time'].dt.hour


# In[52]:


26 in df['Start_Time'].dt.hour


# Values more than 24 is present in hour part of the timestamp!!!


# In[53]:


sns.distplot(df['Start_Time'].dt.dayofweek,bins=7,kde=False,norm_hist=True) 

# daysofweek vs no:of accidents 

# 0 => Monday
# 1 => Tuesday
# 2 => Wedenesday
# 3 => Thursday
# 4 => Friday
# 5 => Saturday
# 6 => Sunday


# Accidents are more during weekdays and less during weekends


# In[54]:


monday_start_time = df['Start_Time'][df['Start_Time'].dt.dayofweek==0]


# In[55]:


sns.distplot(monday_start_time.dt.hour,bins=7,kde=False,norm_hist=True) 

# monday hour vs no:of accidents


# In[56]:


sunday_start_time = df['Start_Time'][df['Start_Time'].dt.dayofweek==6]


# In[57]:


sns.distplot(sunday_start_time.dt.hour,bins=7,kde=False,norm_hist=True) 

# sunday hour vs no:of accidents


# In[58]:


sns.distplot(df['Start_Time'].dt.month,bins=12,kde=False,norm_hist=True) 


# month vs no:of accidents


# In[59]:


df['Start_Time'].dt.year.unique()


# In[60]:


df_2016 = df[df['Start_Time'].dt.year==2016]
df_2017 = df[df['Start_Time'].dt.year==2017]
df_2018 = df[df['Start_Time'].dt.year==2018]
df_2019 = df[df['Start_Time'].dt.year==2019]


# In[61]:


sns.distplot(df_2016['Start_Time'].dt.month,bins=12,kde=False,norm_hist=True) 

# year 2016 month vs no:of accidents


# Much data is missing for 2016


# In[62]:


df_2017 = df[df['Start_Time'].dt.year==2017]


# In[63]:


sns.distplot(df_2017['Start_Time'].dt.month,bins=12,kde=False,norm_hist=True)

# year 2017 month vs no:of accidents


# In[64]:


sns.distplot(df_2018['Start_Time'].dt.month,bins=12,kde=False,norm_hist=True)

# year 2018 month vs no:of accidents


# In[65]:


sns.distplot(df_2019['Start_Time'].dt.month,bins=12,kde=False,norm_hist=True)

# year 2019 month vs no:of accidents


# In[66]:


df['Crossing'].nunique()


# In[67]:


import matplotlib.pylab as plt


# In[68]:


df.columns


# In[69]:


df['Timezone'].nunique()


# In[70]:


df['Timezone'].value_counts().plot(kind='pie')  # Pie chart


# ## Start_Lat & Start_Lng

# In[71]:


sns.scatterplot(x=df['Start_Lng'],y=df['Start_Lat'])  # scatter plot of location of all accidents


# In[72]:


sns.scatterplot(x=df['Start_Lng'],y=df['Start_Lat'],size=0.01)  # size ==> point size


# In[73]:


sample_df = df.sample(int(0.1*len(df))) # To get a sample dataframe of 0.1(10%) the original dataframe
# As its taking more time to plot when whole data is used


# In[74]:


sns.scatterplot(x=sample_df['Start_Lng'],y=sample_df['Start_Lat'],size=0.01)


# In[75]:


pip install folium


# In[76]:


import folium


# In[77]:


# Creating a basemap

map1 = folium.Map()   # World map
map1


# In[78]:


india_lat = 20.593684
india_lng = 78.96288

marker1 = folium.Marker((india_lat,india_lng))
marker1.add_to(map1)    # Adding marker to map


aus_lng = 133.7751
aus_lat = 25.2744
marker2 = folium.Marker((aus_lat,aus_lng))
marker2.add_to(map1)    # Adding marker to map
map1


# In[79]:


for i in df[['Start_Lat','Start_Lng']].sample(100).iteritems():
       print(i)


# In[80]:


# Heatmap
# For creating heatmap, we need list of pair of latitude ang longitude(list of list)

lat_lst =list(df['Start_Lat'])
lng_lst =list(df['Start_Lng'])
lat_lng_lst = list(zip(lat_lst,lng_lst)) # zip ==> gives pairs


# In[81]:


type(lat_lng_lst)


# In[ ]:


sns.heatmap(zip(lat_lst,lng_lst))


# In[ ]:





# In[ ]:


map_z = folium.Map()
for i in lat_lng_lst:
    print(i[0].i[1])
    #marker_z = folium.Marker((i[0],i[1]))
    #marker_z.add_to(map_z)


# In[ ]:


map_z


# ### Insights
# 
# ***No data on New York***
# 
# ***No:of accidents per city increase/decrease exponentially***
# 
# ***4.23% of the cities has more than 1000 accidents***
# 
# ***high_accident_cities and low_accident_cities follows a decreasing exponential distribution***
# 
# ***9.5% or 1110 of cities has reported only 1 accident(need further investigation)***
# 
# ***Most accidents occur in the evening***
