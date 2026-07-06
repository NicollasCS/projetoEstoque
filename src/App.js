import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import Form from './components/Form';

function App() {
  return (
    <div className="app">
      <Header />
    <main className="content">
      <Form />
    </main>
      <Footer />
    </div>
  );
}

export default App;
