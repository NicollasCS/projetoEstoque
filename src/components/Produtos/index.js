import { useState } from "react";
import styles from "./Produtos.module.css";

function Produtos() {
  const [nomeProduto, setNomeProduto] = useState("");
  const [categoria, setCategoria] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [preco, setPreco] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    console.log({ nomeProduto, categoria, quantidade, preco });
  }

  return (
    <form className={styles.formulario} onSubmit={handleSubmit}>
      <h2>Cadastro de produtos</h2>

      <input
        type="text"
        placeholder="Nome do produto"
        value={nomeProduto}
        onChange={(e) => setNomeProduto(e.target.value)}
      />

      <input
        type="text"
        placeholder="Categoria"
        value={categoria}
        onChange={(e) => setCategoria(e.target.value)}
      />

      <input
        type="number"
        placeholder="Quantidade"
        value={quantidade}
        onChange={(e) => setQuantidade(e.target.value)}
      />

      <input
        type="text"
        placeholder="Preço"
        value={preco}
        onChange={(e) => setPreco(e.target.value)}
      />

      <button type="submit">Enviar</button>
    </form>
  );
}

export default Produtos;