# Vendor Extranet System

**Davis & Shirtliff Hackathon 2026**

An AI-powered vendor management and extranet system designed to streamline vendor relationships, procurement processes, and supply chain operations.

## 🌟 Features

### Core Functionality
- **Vendor Management**: Complete vendor lifecycle management from registration to performance tracking
- **Order Management**: End-to-end purchase order processing and tracking
- **User Management**: Role-based access control for internal staff
- **Document Management**: Secure document upload and verification system

### AI-Powered Features
- **Intelligent Vendor Matching**: NLP-based vendor matching to requirements
- **Performance Prediction**: AI-driven vendor performance forecasting
- **Risk Assessment**: Automated risk scoring for vendors and orders
- **Delivery Prediction**: Machine learning-based delivery date estimation
- **Analytics Insights**: AI-generated business insights from data

### Analytics & Reporting
- **Real-time Dashboard**: Comprehensive analytics dashboard
- **Performance Metrics**: Vendor performance tracking and KPIs
- **Spend Analysis**: Procurement spend analytics and trends
- **Custom Reports**: Generate and export custom reports

### Data Management
- **Advanced Search**: Full-text search across vendors and orders
- **Data Export**: Export data in multiple formats (CSV, Excel, PDF)
- **Data Validation**: Comprehensive input validation and sanitization
- **Audit Trail**: Complete activity logging and tracking

## 🏗️ Architecture

### Backend
- **Framework**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based authentication
- **AI/ML**: OpenAI GPT-4, TensorFlow.js, Natural NLP
- **Security**: Helmet, rate limiting, bcrypt encryption

### Frontend
- **Framework**: React 18 with Vite
- **Routing**: React Router v6
- **State Management**: Zustand
- **UI Components**: Tailwind CSS, Headless UI
- **Data Fetching**: React Query
- **Charts**: Recharts, Chart.js

## 📋 Prerequisites

- Node.js >= 18.0.0
- MongoDB >= 6.0
- npm >= 9.0.0
- OpenAI API Key (for AI features)

## 🚀 Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd vendor-extranet-system
```

### 2. Install backend dependencies
```bash
npm install
```

### 3. Install frontend dependencies
```bash
cd frontend
npm install
cd ..
```

### 4. Environment Configuration
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

Edit `.env` and configure:
- MongoDB connection string
- JWT secrets
- OpenAI API key
- Email configuration
- Other environment variables

### 5. Start MongoDB
```bash
# Using MongoDB service
mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## 🎯 Running the Application

### Development Mode

**Backend:**
```bash
npm run dev
```
Server runs on http://localhost:5000

**Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs on http://localhost:3000

**Full Stack (Concurrent):**
```bash
npm run dev:full
```

### Production Mode

**Build Frontend:**
```bash
cd frontend
npm run build
```

**Start Backend:**
```bash
npm start
```

## 📁 Project Structure

```
vendor-extranet-system/
├── backend/
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Business logic & AI services
│   └── server.js        # Entry point
├── frontend/
│   ├── public/          # Static assets
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── layouts/     # Layout components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   ├── store/       # State management
│   │   ├── utils/       # Utility functions
│   │   ├── App.jsx      # Main app component
│   │   └── main.jsx     # Entry point
│   └── index.html
├── logs/                # Application logs
├── uploads/             # Uploaded files
├── .env.example         # Environment template
├── .gitignore
├── package.json
└── README.md
```

## 🔐 Default Users

### Admin User
- Email: admin@davisandshirtliff.com
- Password: Admin@123
- Role: Admin

### Test Vendor
- Email: vendor@example.com
- Password: Vendor@123
- Status: Approved

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register/user` - Register internal user
- `POST /api/auth/register/vendor` - Register vendor
- `POST /api/auth/login/user` - User login
- `POST /api/auth/login/vendor` - Vendor login
- `GET /api/auth/me` - Get current user/vendor
- `POST /api/auth/logout` - Logout

### Vendors
- `GET /api/vendors` - Get all vendors
- `GET /api/vendors/:id` - Get vendor by ID
- `PUT /api/vendors/:id` - Update vendor
- `POST /api/vendors/:id/approve` - Approve vendor
- `GET /api/vendors/:id/performance` - Get vendor performance

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id` - Update order
- `POST /api/orders/:id/approve` - Approve order

### AI Features
- `POST /api/ai/analyze-vendor/:id` - Analyze vendor with AI
- `POST /api/ai/match-vendors` - Match vendors to requirements
- `POST /api/ai/predict-delivery/:orderId` - Predict delivery
- `POST /api/ai/analytics-insights` - Generate AI insights

### Analytics
- `GET /api/analytics/dashboard` - Dashboard statistics
- `GET /api/analytics/vendors` - Vendor analytics
- `GET /api/analytics/orders` - Order analytics
- `POST /api/analytics/reports` - Generate reports

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Helmet.js security headers
- Input validation and sanitization
- CORS configuration
- Account lockout after failed attempts
- Secure file upload handling

## 🤖 AI Features Details

### Vendor Analysis
- Risk score calculation (0-100)
- Recommendation score generation
- Strength and weakness identification
- Performance prediction using GPT-4

### Vendor Matching
- NLP-based requirement analysis
- TF-IDF similarity scoring
- Performance-weighted ranking
- Top vendor recommendations

### Delivery Prediction
- Historical data analysis
- Risk factor assessment
- Delay probability calculation
- Delivery date estimation

### Analytics Insights
- Automated insight generation
- Trend identification
- Actionable recommendations
- Natural language summaries

## 📊 Performance Metrics

The system tracks:
- Vendor performance ratings (1-5 stars)
- On-time delivery rates
- Quality scores
- Order completion rates
- Response times
- Customer satisfaction

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📝 License

MIT License - see LICENSE file for details

## 👥 Team

Davis & Shirtliff Hackathon 2026 Team

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📞 Support

For support, email support@vendorextranet.com

## 🎉 Acknowledgments

- Davis & Shirtliff for hosting the hackathon
- OpenAI for AI capabilities
- MongoDB for database solutions
- React and Node.js communities

---

**Built with ❤️ for Davis & Shirtliff Hackathon 2026**