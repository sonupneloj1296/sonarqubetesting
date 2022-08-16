#!/usr/bin/env python
# coding: utf-8

# In[2]:


import pandas as pd
import numpy as np
import seaborn as sns
import matplotlib.pylab as plt


# In[42]:


wq_df = pd.read_csv('winequalityN.csv')
wq_df.head(3)


# In[19]:


# target variable ==> quality


# In[43]:


wq_df['quality'].nunique()


# In[44]:


wq_df['quality'].value_counts()


# In[45]:


wq_df.shape


# In[46]:


wq_df.isna().sum() # finding missing values


# In[47]:


wq_df = wq_df.dropna() # dropped rows with missing values
wq_df = wq_df.drop('type',axis = 1) # type column is not significant


# In[48]:


wq_df.shape


# In[49]:


wq_df.isna().sum() # missing values treated


# In[50]:


y=wq_df['quality']
x=wq_df.drop('quality', axis=1)


# In[51]:


x.shape


# In[52]:


y.shape


# In[53]:


from sklearn.model_selection import train_test_split #split x and y randomnly-
#so for each time the output will be diffrent
#to keep the data consistant we have to set a seed.random_state!=0, we are setting a seed.

x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=.20,random_state=42,stratify = y) 
#0.67 data will be for training.


# In[54]:


from sklearn.linear_model import LogisticRegression


# In[55]:


classifier = LogisticRegression(multi_class='ovr') #One-vs-Rest
classifier.fit(x_train,y_train) #command for training / fitting the model


# In[56]:


y_pred=classifier.predict(x_test)


# In[57]:


y_pred


# In[58]:


#confusison matrix
from sklearn.metrics import confusion_matrix
print(confusion_matrix(y_test,y_pred)) #only the diagonal values are true predicitons. rest are false


# In[65]:


acc= ((251+418+11)/(49+251+173+2+9+418+137+12+192+11+39))* 100 # accuracy
acc


# OR

# In[64]:


#accuracy
from sklearn.metrics import accuracy_score
accuracy_score(y_test,y_pred)*100


# In[ ]:





# In[ ]:




