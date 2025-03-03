# 📜 **Serverless Blog Platform with Content Moderation Built using AWS Services**  

This repository contains a **serverless blog platform** built using **AWS services**, including **S3, CloudFront, API Gateway, Lambda, DynamoDB, Rekognition, SNS, and CodePipeline**. It enables users to create and manage blog posts with images while ensuring inappropriate content is automatically moderated.  

---

## 🌟 **Features**
- 🏗️ **Serverless architecture** using AWS  
- 🚀 **Fast frontend** powered by **Vite**, hosted on **S3 & CloudFront**  
- 🔄 **Backend API** with **API Gateway + Lambda**  
- 📜 **DynamoDB** for blog storage  
- 📸 **Amazon Rekognition** to moderate uploaded images  
- ⚠️ **SNS notifications** for flagged content  
- 🔧 **CI/CD pipeline** with AWS **CodePipeline & CodeBuild**  
- 🔒 **Private network** setup for secure backend access  
- 🛠️ **Infrastructure as Code (IaC)** with **CloudFormation**  

---

## 🏗️ **Architecture Overview**
### **Frontend (Vite + S3 + CloudFront)**
- The blog frontend is built using **Vite** and hosted on **S3**.
- It is distributed via **CloudFront** with a custom domain.
- The frontend build (`dist/` directory) is deployed to the S3 bucket.

### **Backend (API Gateway + Lambda + DynamoDB)**
- API Gateway routes blog-related requests to **AWS Lambda** functions.
- **DynamoDB** stores blog posts.
- Images are uploaded to **S3**, and **Amazon Rekognition** moderates them.

### **Image Moderation (S3 + Rekognition + SNS)**
- When an image is uploaded, **Amazon Rekognition** checks for inappropriate content.
- If flagged, the image is **deleted from S3**, and an **SNS alert** is sent.

### **CI/CD (AWS CodePipeline + CodeBuild)**
- **Automatic deployments** are triggered when code is pushed to GitHub.
- **CodePipeline** builds and deploys the frontend/backend separately.

### **Notifications & Event-Driven Processing**
- **SNS & SQS** handle event-driven alerts.
- **Lambda functions** process flagged images and send moderation notifications.

![serverless_blog](https://github.com/user-attachments/assets/60a6f074-f63a-4737-9b6d-805828111424)

---

## 🚀 **Getting Started**
### **1️⃣ Clone the Repository**
```bash
git clone https://github.com/suhaib-md/Serverless_Blog_Platform_with_Content_Moderation_AWS.git
cd Serverless_Blog_Platform_with_Content_Moderation_AWS.git
```

### **2️⃣ Install Dependencies**
```bash
npm install  # For frontend
pip install -r requirements.txt  # For backend (if using Python dependencies)
```

### **3️⃣ Deploy Infrastructure**
- Make sure AWS CLI is installed and configured:
```bash
aws configure
```

### **4️⃣ Deploy Frontend**
```bash
cd frontend
npm run build
aws s3 sync dist/ s3://your-s3-bucket-name --delete
```

### **5️⃣ Deploy Backend**
```bash
cd backend
zip -r backend.zip .
aws lambda update-function-code --function-name BlogAPI --zip-file fileb://backend.zip
```

---

## 🖼️ **Image Moderation Flow**
1️⃣ **User uploads an image**  
2️⃣ **S3 triggers a Lambda function**  
3️⃣ **Rekognition scans for moderation labels**  
4️⃣ **If flagged**:
   - 🔴 **Image is deleted from S3**
   - ⚠️ **SNS notification is sent**
   - ❌ **User receives an error message**  
5️⃣ **If safe, the blog post is stored in DynamoDB**  

---

## 🔄 **API Endpoints**
| Method | Endpoint | Description |
|--------|---------|-------------|
| `POST` | `/create-post` | Create a new blog post |
| `GET` | `/posts/{id}` | Fetch a specific blog post |
| `GET` | `/posts` | Get all blog posts |
| `PUT` | `/posts/{id}` | Update a blog post |
| `DELETE` | `/posts/{id}` | Delete a blog post |

---

## 🔧 **Environment Variables**
| Variable | Description |
|----------|-------------|
| `SNS_TOPIC_ARN` | ARN of the SNS topic for moderation alerts |
| `BLOG_TABLE` | DynamoDB table name |
| `AWS_REGION` | Deployment region (e.g., `us-east-1`) |

---

## ✅ **Deployment Automation**
- **CI/CD** is implemented using **AWS CodePipeline**.
- **Automatic deployments** happen on GitHub commits.
- **CodeBuild** handles frontend and backend builds.

---

## 🚨 **Error Handling & Logging**
- Lambda logs are available in **AWS CloudWatch**.
- API errors return **JSON responses** with error messages.
- If the `"Records"` key is missing from an event, the function returns a **400 Bad Request**.

---

## 🛠️ **To-Do List**
- [ ] Add user authentication with Cognito
- [ ] Implement a WYSIWYG editor for rich-text blogs
- [ ] Add pagination for blog posts

---

## 🏆 **Contributing**
1️⃣ **Fork the repo**  
2️⃣ **Create a new branch** (`feature/new-feature`)  
3️⃣ **Commit changes** (`git commit -m "Added new feature"`)  
4️⃣ **Push the branch** (`git push origin feature/new-feature`)  
5️⃣ **Create a Pull Request** 🚀  

---

## 📜 **License**
This project is **open-source** and available under the **MIT License**.  

---

## 📞 **Contact**
👤 **Suhaib**  
📧 Email: [suhaib.muhammed2002@gmail.com]  
🌐 Website: [suhaib.vercel.app](https://suhaib.vercel.app)  

---

### 🎉 **Happy Coding! 🚀**  
