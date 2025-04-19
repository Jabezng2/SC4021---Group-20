#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Wed Apr  9 21:35:52 2025

@author: ashleyhung
"""
import re
import pandas as pd
from textblob import TextBlob

from nltk.corpus import stopwords
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from sklearn.metrics import classification_report
from textblob import TextBlob
from sklearn.metrics import classification_report, confusion_matrix
import seaborn as sns
import matplotlib.pyplot as plt

# Preprocessing

# Load the dataset
df = pd.read_csv("/Users/ashleyhung/Desktop/SC4021---Group-20/data/crypto_exchange_data.csv")

# Load stopwords
stop_words = set(stopwords.words('english'))

# Define enhanced cleaning function
def clean_with_textblob_v2(text):
    if pd.isnull(text):
        return ""

    # Lowercase & remove unwanted patterns
    text = text.lower().strip()
    text = re.sub(r"http\S+|www\S+|https\S+", "", text)      # URLs
    text = re.sub(r"@\w+|#\w+", "", text)                    # Twitter handles & hashtags
    text = re.sub(r"[^a-z\s]", "", text)                     # Special chars & numbers
    text = re.sub(r"\s+", " ", text)                         # Extra spaces

    # Tokenize, remove stopwords, and lemmatize
    blob = TextBlob(text)
    lemmatized = [word.lemmatize() for word in blob.words if word not in stop_words]

    return " ".join(lemmatized)
# Example application on your DataFrame
df["cleaned_text"] = df["cleaned_text"].apply(clean_with_textblob_v2)

df.to_csv("/Users/ashleyhung/Desktop/crypto_exchange_data.csv", index=False)

# IAA (taking out the 1000 samples) 

# Load the dataset
df = pd.read_csv("/Users/ashleyhung/Desktop/SC4021---Group-20/data/crypto_exchange_data.csv")

# Sample 1000 rows from the dataset for evaluation
eval_sample = df[["cleaned_text", "sentiment"]].sample(n=1000, random_state=42).copy()
eval_sample["subjective_label"] = ""
eval_sample["polarity_label"] = ""

# Step 3: Export to CSV for annotation
eval_sample.to_csv("evaluation_sample.csv", index=False)
eval_sample.to_csv("/Users/ashleyhung/Desktop/evaluation_sheet.csv", index=False)

# Replace with your actual file path
file_path = "/Users/ashleyhung/Downloads/Evaluation Sheet (IAA).csv"
eval_df = pd.read_csv(file_path, header = 3)
eval_df = eval_df.iloc[2:].reset_index(drop=True)

# Classification

# VADER
analyzer = SentimentIntensityAnalyzer()

# Apply VADER to get compound scores
eval_df["vader_compound"] = eval_df["cleaned_text"].apply(lambda x: analyzer.polarity_scores(str(x))["compound"])

# Define function to map compound to polarity label
def vader_to_polarity_label(score):
    if score >= 0.05:
        return 1  # Positive
    elif score <= -0.05:
        return 0  # Negative
    else:
        return 2  # Neutral

# VADER polarity prediction
eval_df["vader_pred"] = eval_df["vader_compound"].apply(vader_to_polarity_label)

# GT column in numeric format 
# 0 = Negative, 1 = Positive, 2 = Neutral
eval_df["GT. polarity_label"] = eval_df["GT. polarity_label"].astype(int)


# Classification report
print("\nPolarity Classification Report:")
print(classification_report(eval_df["GT. polarity_label"], eval_df["vader_pred"],
                            target_names=["Negative", "Positive", "Neutral"]))

# Plot confusion matrix
cm = confusion_matrix(eval_df["GT. polarity_label"], eval_df["vader_pred"])
plt.figure(figsize=(6, 5))
sns.heatmap(cm, annot=True, fmt='d', cmap='viridis',
            xticklabels=["Negative", "Neutral", "Positive"],
            yticklabels=["Negative", "Neutral", "Positive"])

plt.xlabel("Predicted label", fontsize=12)
plt.ylabel("True label", fontsize=12)
plt.title("Polarity Confusion Matrix", fontsize=14, weight='bold')
plt.show()

# TextBlob
def get_textblob_sentiment(text):
    blob = TextBlob(str(text))
    return blob.polarity, blob.subjectivity

eval_df["textblob_polarity_score"], eval_df["textblob_subjectivity_score"] = zip(*eval_df["cleaned_text"].map(get_textblob_sentiment))

# Map polarity score to labels: 0 = Negative, 1 = Positive, 2 = Neutral
def polarity_label(score):
    if score > 0.05:
        return 1
    elif score < -0.05:
        return 0
    else:
        return 2

# Map subjectivity score to labels: 0 = Objective, 1 = Subjective
def subjectivity_label(score):
    return 1 if score >= 0.5 else 0

eval_df["textblob_polarity_label"] = eval_df["textblob_polarity_score"].apply(polarity_label)
eval_df["textblob_subjectivity_label"] = eval_df["textblob_subjectivity_score"].apply(subjectivity_label)

# Ensure ground truth columns are integer
eval_df["GT. polarity_label"] = eval_df["GT. polarity_label"].astype(int)
eval_df["GT. subjective_label"] = eval_df["GT. subjective_label"].astype(int)


# Polarity Classification Report 
print("\nPolarity Classification Report:")
print(classification_report(eval_df["GT. polarity_label"], eval_df["textblob_polarity_label"], target_names=["Negative", "Positive", "Neutral"]))

# Subjectivity Classification Report 
print("\nSubjective Classification Report:")

print(classification_report(eval_df["GT. subjective_label"], eval_df["textblob_subjectivity_label"], target_names=["Objective", "Subjective"]))

# Plot polarity confusion matrix
polarity_cm = confusion_matrix(eval_df["GT. polarity_label"], eval_df["textblob_polarity_label"])
plt.figure(figsize=(6, 5))
sns.heatmap(polarity_cm, annot=True, fmt='d', cmap='Blues', xticklabels=["Negative", "Positive", "Neutral"], yticklabels=["Negative", "Positive", "Neutral"])
plt.title("TextBlob Polarity Confusion Matrix")
plt.xlabel("Predicted Label")
plt.ylabel("True Label")
plt.show()

# Plot subjectivity confusion matrix
subjectivity_cm = confusion_matrix(eval_df["GT. subjective_label"], eval_df["textblob_subjectivity_label"])
plt.figure(figsize=(5, 4))
sns.heatmap(subjectivity_cm, annot=True, fmt='d', cmap='Greens', xticklabels=["Objective", "Subjective"], yticklabels=["Objective", "Subjective"])
plt.title("TextBlob Subjectivity Confusion Matrix")
plt.xlabel("Predicted Label")
plt.ylabel("True Label")
plt.show()







