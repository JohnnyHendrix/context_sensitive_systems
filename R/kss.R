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
                                      return_xts = FALSE)
dataset = as.data.frame(dataset)
str(dataset)
# Peek at the data for good measure
head(dataset)

#Sort columns -> user and context gets to the end and time, alpha, beta, gamma, x, y, z first
dataset<-dataset[c(1,2,3,5,7,8,9,4,6)]

# Rename column names
names(dataset) <- c("time", "alpha", "beta", "gamma", "x", "y", "z", "context", "user")

# catch all users in db
users = unique(dataset$user)

# catch all unqiue activities in our case 'gehen', 'stehen', 'treppe'
context = unique(dataset$context)

# cor(dataset[dataset$context==context[1],1:3])

# get the dimension of the dataset to check
dim(dataset)

###########################  STEP 2 - CREATE VALIDATION SET ###########################

# Create a list of 80% of the rows in the original dataset we can use for training
validation_index<-createDataPartition(dataset$context, p =0.80, list = FALSE)

# Select 20% of the data for validation
validation<-dataset[-validation_index, ]
head(validation)
# Use the remaining 80% of data to train and test the models
dataset<-dataset[validation_index, ]

###########################  STEP 3 - SUMMARIZE DATASET ###########################

# Check again the dimension of the dataset and see if the dataset is reduced to 80%
dim(dataset)


# TODO DIM SPlit vorher nachher = 0.8
# set the context column as type 'factor' to get later all levels
dataset$context <- as.factor(dataset$context)

# List types for each attribute
sapply(dataset,class)

# View first five rows of the data
head(dataset)

# Get the levels to check what kind of classification problems we have (multi/binary)
levels(dataset$context)

# Summarize the class distribution
percentage<-prop.table(table(dataset$context)) * 100
cbind(freq = table(dataset$context), percentage = percentage)

# Summarize attribute distributions
summary(dataset)

###########################  STEP 4 - VIZUALIZATION ###########################

# Split input and output x = alpha, beta, gamma, x, y, z
x<-dataset[,2:7]

# y = context
y<-dataset[ ,9]

# Boxplot for each attribute on one image
par(mfrow=c(2,7))
for(i in 2:7) {
  boxplot(x[,i], main=names(dataset)[i])
}

# Barplot of class breakdown
library(dplyr)
library(ggplot2)

dataset %>% ggplot(aes(x= y)) + geom_bar() +labs(x = "Context")

# scatterplot matrix
featurePlot(x=x, y=y, plot="ellipse")

# scatterplot matrix
featurePlot(x=x, y=y, plot="pairs")

# Density plots for each attribute by species class value
scales<-list(x = list(relation = "free"), y = list(relation = "free"))
featurePlot(x = x, y = y, plot = "density", scales = scales)

###########################  STEP 5 - ALGORITHM EVALUATION ###########################


# Run algorithms using 10-fold cross validation
control<-trainControl(method = "cv", number = 10)
metric<-"Accuracy"

# Linear Discriminant Analysis (LDA)  
set.seed(7)
fit.lda <- train(context~., data=dataset, method="lda", metric=metric, trControl=control)

# Classification and Regression Trees (CART)
set.seed(7)
fit.cart <- train(context~., data=dataset, method="rpart", metric=metric, trControl=control)

# k-Nearest Neighbors (kNN)
set.seed(7)
fit.knn <- train(context~., data=dataset, method="knn", metric=metric, trControl=control)

# Support Vector Machines (SVM)
set.seed(7)
fit.svm <- train(context~., data=dataset, method="svmRadial", metric=metric, trControl=control)

# Random Forest (RF)
set.seed(7)
fit.rf <- train(context~., data=dataset, method="rf", metric=metric, trControl=control)

# Summarize model accuracy for each model
results <- resamples(list(lda=fit.lda,cart=fit.cart, knn=fit.knn, svm=fit.svm, rf=fit.rf))
summary(results)

# Compare accuracy of models
dotplot(results)

# Summarize Best Model
print(fit.knn)


###########################  STEP 6 - PREDICTIONS ###########################

# Estimate skill of KNN on the validation dataset
predictions<-predict(fit.knn, validation)
confusionMatrix(predictions, validation$context)


library(pmml)
library(rpart)

dataset$user <- as.factor(dataset$user)
my.rpart <- rpart(context ~ ., data=dataset[,2:8])
my.rpart

pmml(my.rpart)
saveXML(pmml(my.rpart), file = "my_rpart.xml")
