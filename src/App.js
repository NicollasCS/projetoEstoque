import './App.css';
import { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Form from './components/Form';
import Produtos from './components/Produtos';

function App() {
  const [mostrarProdutos, setMostrarProdutos] = useState(false);

  return (
    <div className="app">
      <Header />
      <main className="content">
        {mostrarProdutos ? (
          <Produtos />
        ) : (
          <Form onCadastroSucesso={() => setMostrarProdutos(true)} />
        )}
      </main>
      <Footer />
    </div>
  );
}

export default App;
