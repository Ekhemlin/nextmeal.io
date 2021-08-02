# Serverless-Spoon


Serverless Spoon is a meal-planning site written with a React.js frontend, and an AWS [Serverless Application Model](https://aws.amazon.com/serverless/sam/) backend. The site is deployed at [planyourmeal.online](https://planyourmeal.online).


Its current features are: 

- Groceries inventory management.
- Tracking custom macronutrient goals. 
- Recipe planning and search using the [Sponnacular's API](https://spoonacular.com/food-api).
- Prediction of recipe healthiness using a Keras Neural Network and the [OpenFoodFacts API](http://openfoodfacts.org).

## Technical Description 

The complete stack used to develop the project is: 

**Backend**: Node.js running on AWS Lambda + API Gateway 

**Database**: DynamoDB 

**Frontend**: React.js and Bootstrap

**Web Deployment**: Nginx + Let's Encrypt running on EC2  

**Machine Learning**: Python and Keras


The full list of API endpoints for the backend is available in [SAM-backend/ENDPOINTS.md](https://github.com/Ekhemlin/Serverless-Spoon/blob/main/SAM-backend/ENDPOINTS.md)

## Building the project

### Requirements: 

To build and deploy the project, you need to have:

- An AWS account. 
- The AWS CLI [installed](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv1.html) and [configured](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html). 
- The [SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html) installed.
- [npm](https://www.npmjs.com/) and [pip](https://pypi.org/project/pip/) installed. 

### Setup instructions: 


- Clone the repository.  
- `cd serverlessSpoon/SAM-backend`
- Run `sam build && sam deploy`.
- Inside your AWS management console, go to the API Gateway page and ensure you have an API group named `sam-app`.
- Copy the value of the `ID` field for sam-app. 
- `cd ../frontend`
- Create a `.env` file in `serverlessSpoon/frontend ` with the variable `API_ENDPOINT=<sam-app ID>`.
- Run `npm install`.
- Run `npm start`.
