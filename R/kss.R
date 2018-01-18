# libraries
library(influxdbr2)
library(xts)
library(foreign)
library(caret)
library(zoo)
library(foreach)
library(ggvis)

###########################  STEP 1 - GET DATA AND PREPROCESSING ###########################

# create influx connection object
con <- influxdbr2::influx_connection(host = "138.68.73.47",
                                     port = 8086,
                                     user = "kss",
                                     pass = "kss_ss17")

# create new database
# influxdbr2::create_database(con = con, db = "kss")

# Select all from document kss_kay and group by context and user id
# result <- influx_query_xts(con, db="kss",query="SELECT * FROM kss_kay GROUP BY context, user_id")

# select FileScanner values from kss_kay and do not return xts
dataset = influxdbr2::influx_select(con = con,
                                      db = "kss",
                                      value = "*",
                                      from = "kss_kay",
                                      return_xts = TRUE)

# Funktion zur Berechnung von Features mit Sliding Window
calc_features<- function(data,columns,features,width,by){
  x<-foreach(s=columns,.combine=cbind) %:% 
    foreach(f=features,.combine=cbind) %do% 
    {data.frame(rollapply(data=data[,s], width=width, by=by, FUN=get(f), na.rm=TRUE)) }
  # Spaltennamen setzen
  c<-foreach(s=columns,.combine=c) %:% 
    foreach(f=features,.combine=c) %do% { paste(s,f,sep="_")}
  colnames(x)[]<-c
  return(x)  
}

dataset = data.frame(dataset)
str(dataset)
# Peek at the data for good measure
head(dataset)

# catch all unqiue activities in our case 'gehen', 'stehen', 'treppe'

# cor(dataset[dataset$context==context[1],1:3])

# get the dimension of the dataset to check
dim(dataset)


###########################  STEP 2 - SLIDING WINDOW WITH MEAN AND SD ###########################

activities = c("gehen", "stehen", "treppe")
sensors = c("alpha", "beta", "gamma")
users = unique(dataset$user_id)
users = c("Kay")
fun=c("mean","sd")
w = 40
users
data=foreach(u=users,.combine=rbind)%:%
  foreach(a=activities,.combine=rbind)%do%
  {
    d = filter(dataset, context == a & user_id == u)
    t=calc_features(d,sensors,fun,w,w/2)
    l=data.frame(d[seq(w-1,nrow(d),w/2),"context"],rep(u,length.out=nrow(t)))
    colnames(l) = c("label","user")
    cbind(l,t)
    return(cbind(l,t))
    
  }

library(pmml)
library(rpart)
head(data)
my.rpart <- rpart(label ~ ., data=data)
my.rpart
pmml(my.rpart)
saveXML(pmml(my.rpart), file = "kss.xml")

###########################  STEP 3 - CREATE VALIDATION SET ###########################

# Create a list of 80% of the rows in the original dataset we can use for training
validation_index<-createDataPartition(dataset$context, p =.8, list = FALSE, times = 1)

# Select 20% of the data for validation
test<-dataset[-validation_index, ]

# Use the remaining 80% of data to train and test the models
train<-dataset[validation_index, ]

###########################  STEP 4 - SUMMARIZE DATASET ###########################

# Check again the dimension of the train dataset and see if the train dataset is reduced to 80%
dim(train)


# TODO DIM SPlit vorher nachher = 0.8
# set the context column as type 'factor' to get later all levels
train$context <- as.factor(train$context)

# List types for each attribute
sapply(train,class)

# View first five rows of the data
head(train)

# Get the levels to check what kind of classification problems we have (multi/binary)
levels(train$context)

# Summarize the class distribution
percentage<-prop.table(table(train$context)) * 100
cbind(freq = table(train$context), percentage = percentage)

# Summarize attribute distributions
summary(train)

###########################  STEP 5 - VIZUALIZATION ###########################

# Split input and output x = alpha, beta, gamma, x, y, z
x<-train[,1:6]

# y = context
y<-train[ ,7]

plot(y)
# Boxplot for each attribute on one image
par(mfrow=c(1,6))
for(i in 1:6) {
  boxplot(x[,i], main=names(train)[i])
}

# Barplot of class breakdown
library(dplyr)
library(ggplot2)

train %>% ggplot(aes(x= y)) + geom_bar() +labs(y = "Context")

# scatterplot matrix
featurePlot(x=x, y=y, plot="ellipse")

# scatterplot matrix
featurePlot(x=x, y=y, plot="pairs")

# Density plots for each attribute by species class value
scales<-list(x = list(relation = "free"), y = list(relation = "free"))
featurePlot(x = x, y = y, plot = "density", scales = scales)

###########################  STEP 6 - ALGORITHM EVALUATION ###########################


# Run algorithms using 10-fold cross validation
control<-trainControl(method = "cv", number = 10, repeats = 1)
metric<-"Accuracy"

# Linear Discriminant Analysis (LDA)  
set.seed(7)
fit.lda <- train(context~., data=train, method="lda", metric=metric, trControl=control)

# Classification and Regression Trees (CART)
set.seed(7)
fit.cart <- train(context~., data=train, method="rpart", metric=metric, trControl=control)

# k-Nearest Neighbors (kNN)
set.seed(7)
fit.knn <- train(context~., data=train, method="knn", metric=metric, trControl=control)

# Support Vector Machines (SVM)
set.seed(7)
fit.svm <- train(context~., data=train, method="svmRadial", metric=metric, trControl=control)

# Random Forest (RF)
set.seed(7)
fit.rf <- train(context~., data=train, method="rf", metric=metric, trControl=control)

# Summarize model accuracy for each model
results <- resamples(list(lda=fit.lda,cart=fit.cart, knn=fit.knn, svm=fit.svm, rf=fit.rf))
summary(results)

# Compare accuracy of models
dotplot(results)

# Summarize Best Model
print(fit.rf)


###########################  STEP 7 - PREDICTIONS ###########################

# Estimate skill of KNN on the validation dataset
predictions<-predict(fit.rf, test)
confusionMatrix(predictions, test$context)
