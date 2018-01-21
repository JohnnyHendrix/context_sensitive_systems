# libraries
library(influxdbr2)
library(xts)
library(foreign)
library(caret)
library(zoo)
library(foreach)
library(ggvis)
library(AppliedPredictiveModeling)
library(dplyr)

###########################  STEP 1 - DATA PREPROCESSING ###########################

# Create influx connection object
con <- influxdbr2::influx_connection(host = "138.68.73.47",
                                     port = 8086,
                                     user = "kss",
                                     pass = "kss_ss17")

# Select FileScanner values from kss_kay and do not return xts
dataset = influxdbr2::influx_select(con = con,
                                    db = "kss",
                                    value = "*",
                                    from = "kss_riedel",
                                    return_xts = TRUE)

dataset = data.frame(dataset)

# Peek at the data for good measure
head(dataset)
dataset$user_id
# get the dimension of the dataset to check
dim(dataset)

dataset = dataset[, c(1,2,4,3,5,6,7,8)]
dataset = dataset[,4:8]
dataset$context = factor(dataset$context, levels = c('gehen', 'stehen', 'treppe'), labels = c(1,2,3))

# Feature Scaling
#train[,3:5] = scale(train[,3:5], scale = TRUE)
#test[,3:5] = scale(test[,3:5], scale = TRUE)

###########################  STEP 2 - SLIDING WINDOW WITH VARIANCE ###########################

# Funktion zur Berechnung von Features mit Sliding Window
# calc_features( [CONTEXT_USER], sensors,"var", windows,window/2)
#%do% evaluates the expression sequentially, while %dopar% evalutes it in parallel
calc_features<- function(data,columns,features,width,by){
  x<-foreach(s=columns,.combine=cbind) %:% 
    foreach(f=features,.combine=cbind) %do% 
    # rollapply (by used only if width = 1 (to calc fun at by-th time))
    {data.frame(rollapply(data=data[,s], width=width, by=by, FUN=get(f), na.rm=TRUE)) }
  # Spaltennamen setzen
  c<-foreach(s=columns,.combine=c) %:% 
    foreach(f=features,.combine=c) %do% { paste(s,f,sep="_")}
  colnames(x)[]<-c
  return(x)  
}


activities = levels(dataset$context)
sensors = c("x", "y", "z")
users = unique(dataset$user_id)
users
w = 20

data=foreach(u=users,.combine=rbind)%:%
  foreach(a=activities,.combine=rbind)%do%
  {
    # d = CONTEXT_USER_SET
    d = filter(dataset, context == a & user_id == u)
    
    t=calc_features(d,sensors,"var",w,w/2)
    # set context and user to the windowed data
    l=data.frame(d[seq(w-1,nrow(d),w/2),"context"],rep(u,length.out=nrow(t)))
    colnames(l) = c("context","user_id")
    cbind(l,t)
    return(cbind(l,t))
  }

# 1: context, var: 3:x, 4:y, 5:z, 2: user
dataset_var = data[,c(1,2,3,4,5)]

dataset_var
# create leave-one-subject-out data set by ignoring the first user
random_users_index <- sample(1:length(users), 1)
random_users_index
loso_train_data <- dataset_var[dataset_var$user_id != users[random_users_index],]
loso_test_data <- dataset_var[dataset_var$user_id == users[random_users_index],]

loso_users <- unique(loso_train_data$user_id)
ignored_user <- unique(loso_test_data$user_id)
loso_users
ignored_user

loso_train_data <- loso_train_data[,c(1,3,4,5)]
loso_test_data <- loso_test_data[,c(1,3,4,5)]
final_data = dataset_var[,c(1,3,4,5)]


# Split Data into training set and test set
library(caTools)
set.seed(123)

#split = sample.split(dataset$context, SplitRatio = 2/3)
#train = subset(dataset, split == TRUE)
#test = subset(dataset, split == FALSE)

# write xml
library(pmml)
library(rpart)
library("rpart.plot")

# Run algorithms using 10-fold cross validation
control<-trainControl(method = "cv", number = 10, repeats = 1)

# Decision Tree: Train and Test (Evaluate with confusionMatrix)
set.seed(7)
dtree_train_classifier <- train(context ~., data = loso_train_data, method = "rpart", parms = list(split = "information"),
                   trControl=control,
                   tuneLength = 10)
predictions<-predict(dtree_train_classifier, loso_test_data)
confusionMatrix(predictions, loso_test_data$context)

dtree_final_classifier <- train(context ~., data = final_data, method = "rpart", parms = list(split = "information"),
                         trControl=control,
                         tuneLength = 10)
dtree_final_classifier
predictions<-predict(dtree_final_classifier, loso_test_data)
confusionMatrix(predictions, loso_test_data$context)

saveXML(pmml(dtree_final_classifier$finalModel), file = "kss_var.xml")
rpart.plot(dtree_final_classifier$finalModel)
featurePlot(x = final_data[,2:4], 
            y = final_data[,1], 
            plot = "ellipse",
            ## Add a key at the top
            auto.key = list(columns = 3))

