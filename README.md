# AI Photo Journal

AI Photo Journal is a web application designed to automatically generate daily journal entries by gathering user-uploaded photos and optionally creating annotations, collages, and summaries. Users can write their own entries and upload photos, with a clean and simple interface to track their daily activities visually.

## Current Features

- **Photo Upload**: Users can upload photos, and the system will store them in a structured folder format.
- **Journal Entries**: Users can create and store journal entries, which are saved in a PostgreSQL database.
- **Photo Storage**: Automatically organizes photos by date in a folder structure.
- **Database Management**: Journal entries are saved to PostgreSQL using an Express backend.

## Project Status

The current build includes the basic functionality of photo uploads, journal entry creation, and database management. The web app is running successfully on Heroku with server-side and database functionality operational. Users can upload photos, view them, and write journal entries.

### Technologies Used:

- **Node.js**: Backend for server-side logic.
- **Express**: Web framework for routing and serving API endpoints.
- **PostgreSQL**: Database to store journal entries.
- **Heroku**: Cloud platform for app deployment.
- **HTML/CSS/JavaScript**: Frontend technologies for basic user interface.

### Installation & Setup

To run this project locally, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/ai_photo_journal.git
   cd ai_photo_journal
   ```

### Install Dependencies

npm install

### Set up your PostgreSQL database and configure the `.env` file with your credentials:

DATABASE_URL=your_postgresql_connection_string
PORT=8080

### Start the server:

npm start

### Access the app locally:

http://localhost:8080

### Deployment on Heroku

This app is deployed on Heroku, and you can view it live [here]().

To deploy your own instance on Heroku:

1. Log in to your Heroku account and create a new app.
2. Push the code to Heroku:`<git push heroku main>`

### Deployment on Vercel (Future)

* Future deployment on Vercel for optimized frontend delivery and API handling, allowing for faster load times and scaling.

To deploy your own instance on Vercel:

1. Sign up for a Vercel account.
2. Link your GitHub repository and follow the prompts to deploy automatically.

### Future Additions

The AI Photo Journal is just getting started! Here's a roadmap for exciting features planned for future versions:

#### 1. **Firebase Authentication**

* Add secure user authentication using Firebase. This will allow multiple users to log in, each managing their own journal entries and photo uploads.
* Integration of OAuth login methods (e.g., Google, Facebook) for easy and secure authentication.

#### 2. **ChatGPT Integration for Automatic Annotations**

* Automatically generate journal annotations or summaries based on uploaded photos using OpenAI’s GPT models.
* Users will be able to enable/disable this feature or provide optional custom annotations on top of the AI-generated ones.

#### 3. **Advanced Data Analytics**

* Provide users with insights on their journaling habits, such as most frequent topics, time spent writing, and recurring themes, using data analysis techniques.
* Visual analytics showing trends in activities over time.

#### 4. **AI Photo Enhancement**

* Integrate AI-powered photo enhancement features to improve the quality of uploaded images, offering auto-adjustments like color correction, sharpening, and noise reduction.

#### 5. **UI for Managing Timescale**

* Implement a timeline view where users can navigate through their past entries and photos, with the ability to jump to specific dates and see multiple entries side by side.

#### 6. **Stripe Integration for Payments**

* Integrate Stripe for payment functionality. The goal is to offer a premium subscription for additional features like AI photo enhancement, priority support, and more advanced data analytics.
* Provide users with the ability to subscribe or make one-time payments for certain premium features.

#### 7. **Automated Collage Making**

* Automatically create collages from a user's photos using AI-driven photo selection and layout techniques.
* Allow users to adjust the collage manually or let the system generate it based on photo metadata like time and location.

## Contributing

If you're interested in contributing to AI Photo Journal, feel free to open an issue or submit a pull request. All contributions are welcome, including bug fixes, feature requests, and code improvements.

To contribute:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/YourFeature`)
3. Make your changes and commit (`git commit -m 'Add your feature'`)
4. Push the branch (`git push origin feature/YourFeature`)
5. Open a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Created and maintained by  **Aaron Snyder** .
For questions or feedback, feel free to contact me at `aaron.q.snyder@gmail.com`.
