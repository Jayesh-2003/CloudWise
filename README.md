# CloudWise: AI Agents for AWS Cost & Compliance Optimization

**Your intelligent AWS co‑pilot for cost and security optimization**

## Inspiration

During our interactions with various cloud managers and DevOps teams, we uncovered a critical challenge that resonates across industries: a significant portion of DevOps engineers' time—up to 30-40%—is spent manually managing and silencing noisy CloudWatch alarms, many of which are false positives or of low priority. This repetitive task not only wastes valuable time but also incurs unnecessary costs, creating a cycle of inefficiency and security risks. Recognizing this widespread pain point as a fundamental bottleneck in cloud operations, we saw an opportunity to leverage AI to address and automate it, transforming cloud management into a more intelligent and self-sufficient process.

Our idea was fueled by the realization that a self-healing, AI-powered system could significantly reduce operational overhead, improve accuracy, and boost cost savings. This motivated us to develop a comprehensive autonomous agent system that intelligently manages alarms, performs remediation actions in real-time, and ensures better security and compliance—all on the cloud platform that companies rely on daily.

## What it does

Our project, CloudWise, is designed to make cloud management smarter and more efficient. It continuously monitors AWS environments through a combination of cost tracking, compliance checks, and operational alerts.

### Key Features

- **Multi-Account Management**: Register and manage multiple AWS accounts securely using IAM Role ARNs.
- **Cost Optimization**: Detect idle EC2 instances across connected accounts and shut them down manually or automatically to save costs.
- **Security & Compliance**: Monitor S3 buckets and other resources for unauthorized access and enforce security policies.
- **AI-Powered Chatbot**: An intelligent assistant powered by **Amazon Bedrock** that answers questions about your cloud infrastructure and alarms.
- **Automated Remediation**: Toggle specific automation rules (e.g., "Auto-Stop Idle Instances") to let the system self-heal.
- **Real-Time Logging**: View detailed logs of all detected issues and automated actions taken by the system.

What makes CloudWise truly innovative is its AI-driven decision-making capability, powered by **Amazon Bedrock's Titan model**. This AI agent evaluates various signals, reasons about appropriate actions, and even provides recommendations, making the system not just reactive but proactively intelligent.

## How we built it

Our journey began with understanding critical pain points through industry conversations. We designed a modern, modular web application using **Next.js** to serve as the central command hub.

- **Frontend**: Built with **Next.js (React)** and **Tailwind CSS**, offering a premium, responsive dashboard to visualize data and control automation settings.
- **Backend API**: Leveraged **Next.js API Routes** to create a secure interface between the frontend and AWS services.
- **AI Integration**: Integrated **Amazon Bedrock (Titan Model)** via the AWS SDK to power the reasoning engine and chatbot.
- **Database**: Used **Amazon DynamoDB** for high-performance logging of actions, storing account registries, and managing automation toggles.
- **Cloud Management**: Utilized the **AWS SDK for JavaScript (v3)** to interact with EC2, CloudWatch, and STS (for cross-account role assumption).

## Challenges we ran into

One of the major hurdles was managing permissions—AWS security policies needed fine-tuning to allow the application to perform actions safely across different accounts without over-permissioning. Synchronizing real-time alarm triggers with AI decision-making required careful event orchestration. Additionally, training and prompting Amazon Bedrock’s Titan model to reliably reason about cloud states and actions was complex, requiring multiple iterations for clarity and precision.

## Accomplishments that we're proud of

We’re particularly proud of creating a system that demonstrates true autonomous behavior—not just alerting but actively remediating issues without manual input. Our successful integration of Amazon Bedrock’s foundational model for reasoning and the dynamic automation of both cost and security policies represent a significant milestone. Additionally, our implementation of a real-time, filterable dashboard that combines logs, compliance benchmarks, and AI reasoning outputs provides a transparent and actionable view into the system’s operations.

## What we learned

Throughout this project, we learned the immense power of combining AI reasoning with cloud automation. Fine-tuning prompts for large language models like Bedrock Titan is crucial for generating reliable decisions under operational constraints. We also realized the importance of designing secure, minimal-privilege IAM roles and the value of modular, extensible architecture for future growth.

## What’s next for CloudWise

Looking ahead, we aim to expand CloudWise’s capabilities by incorporating additional AWS resources like RDS and EKS, and integrating security tools such as AWS Security Hub for comprehensive compliance monitoring. Enhancing the AI reasoning capabilities to include multimodal inputs and explanations will make the system more transparent and trustworthy.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org) (React)
- **Styling**: Tailwind CSS
- **Cloud Platform**: AWS
- **AI Model**: Amazon Bedrock (Titan Foundation Model)
- **Database**: Amazon DynamoDB
- **SDKs**: AWS SDK for JavaScript v3 (`@aws-sdk/client-ec2`, `@aws-sdk/client-bedrock-runtime`, `@aws-sdk/lib-dynamodb`)

## How to Access the Project

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd cloudwise-ui
```

### Step 2: Install Dependencies

```bash
npm install
# or
yarn install
```

### Step 3: Configure Environment Variables

Create a `.env.local` file in the root directory and add your AWS credentials and configuration. You will need an AWS account with access to Bedrock, DynamoDB, and EC2.

```env
# AWS Credentials (ensure these have permissions to assume roles and access Bedrock/DynamoDB)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# Amazon Bedrock Configuration
BEDROCK_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0
```

### Step 4: Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
