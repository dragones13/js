document.addEventListener("DOMContentLoaded", () => {
    const pokedexElement = document.getElementById("pokedex");
    const modal = document.getElementById("modal");
    const modalClose = document.querySelector(".close");
    const modalImage = document.getElementById("modal-image");
    const modalInfo = document.getElementById("modal-info");
    const searchInput = document.getElementById("search-input");

    let pokemonsData = []; // Array para armazenar todos os dados dos Pokémon carregados

    const fetchPokemon = async () => {
        try {
            const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=100');
            if (!response.ok) {
                throw new Error('Erro ao carregar Pokémon');
            }
            const data = await response.json();
            const pokemons = data.results;

            // Limpa o conteúdo anterior da pokedex
            pokedexElement.innerHTML = '';

            // Itera sobre a lista de Pokémon e carrega seus dados completos
            await Promise.all(pokemons.map(async (pokemon) => {
                const pokemonData = await fetchPokemonData(pokemon.url);
                pokemonsData.push(pokemonData);
            }));

            // Exibe todos os Pokémon inicialmente
            displayPokemons(pokemonsData);
        } catch (error) {
            console.error('Erro:', error);
            pokedexElement.innerHTML = `<p>Erro ao carregar Pokémon: ${error.message}</p>`;
        }
    };

    const fetchPokemonData = async (url) => {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Erro ao carregar dados do Pokémon');
            }
            return await response.json();
        } catch (error) {
            console.error('Erro:', error);
            return null;
        }
    };

    const displayPokemons = (pokemons) => {
        if (!pokemons || pokemons.length === 0) {
            pokedexElement.innerHTML = '<p>Nenhum Pokémon encontrado.</p>';
            return;
        }
        
        pokedexElement.innerHTML = ''; // Limpa a lista de Pokémon

        pokemons.forEach(pokemon => {
            const pokemonContainer = createPokemonElement(pokemon);
            pokedexElement.appendChild(pokemonContainer);
        });
    };

    const createPokemonElement = (pokemon) => {
        const pokemonContainer = document.createElement('div');
        pokemonContainer.classList.add('pokemon-container'); // Adiciona uma classe para estilo CSS

        const pokemonName = document.createElement('h3');
        pokemonName.textContent = pokemon.name;
        pokemonContainer.appendChild(pokemonName);

        const pokemonImage = document.createElement('img');
        pokemonImage.src = pokemon.sprites.front_default;
        pokemonImage.alt = pokemon.name;
        pokemonImage.classList.add('pokemon-image');
        pokemonContainer.appendChild(pokemonImage);

        // Adicionar evento de clique para exibir o modal com informações do Pokémon
        pokemonContainer.addEventListener('click', () => {
            showModal(pokemon);
        });

        // Adicionar botão de download
        const downloadButton = document.createElement('button');
        downloadButton.textContent = 'Download';
        downloadButton.addEventListener('click', () => {
            downloadPokemonImage(pokemon.sprites.front_default, `${pokemon.name}.png`);
        });
        pokemonContainer.appendChild(downloadButton);

        return pokemonContainer;
    };

    const showModal = (pokemon) => {
        modal.style.display = "block"; // Mostrar o modal

        // Exibir imagem do Pokémon no modal
        modalImage.src = pokemon.sprites.front_default;
        modalImage.alt = pokemon.name;

        modalImage.style.width = "30%";
        modalImage.style.height = "30%";

        modalImage.style.border = "solid 1px #0ee9ed";
        modalImage.style.borderImage = "linear-gradient(to right, #00c6ff, #0072ff) 1";
        // Exibir informações do Pokémon no modal
        const info = `
            <p><strong>Nome:</strong> ${pokemon.name}</p>
            <p><strong>Altura:</strong> ${pokemon.height}</p>
            <p><strong>Peso:</strong> ${pokemon.weight}</p>
            <p><strong>Tipo(s):</strong> ${pokemon.types.map(type => type.type.name).join(', ')}</p>
        `;
        modalInfo.innerHTML = info;
        animateBorder();
    };

    const animateBorder = () => {
        modalImage.style.animation = "shine-border 1.5s infinite linear";
    };
    
    // CSS para a animação de brilho
    const styles = `
        @keyframes shine-border {
            0% {
                box-shadow: 0 0 0 0 rgba(0, 198, 255, 0.7);
            }
            50% {
                box-shadow: 0 0 20px 10px rgba(0, 198, 255, 0.7);
            }
            100% {
                box-shadow: 0 0 0 0 rgba(0, 198, 255, 0.7);
            }
        }
    `;
    
    // Inserir o estilo na cabeça do documento
    const styleElement = document.createElement('style');
    styleElement.appendChild(document.createTextNode(styles));
    document.head.appendChild(styleElement);

    // Fechar o modal ao clicar no botão de fechar (×) ou fora do modal
    modalClose.addEventListener('click', () => {
        modal.style.display = "none";
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });

    // Função para filtrar os Pokémon de acordo com o termo de pesquisa
    const filterPokemons = (searchTerm) => {
        const filteredPokemons = pokemonsData.filter(pokemon => {
            return pokemon.name.toLowerCase().includes(searchTerm.toLowerCase());
        });
        displayPokemons(filteredPokemons);
    };
             // Evento de tecla pressionada no input de pesquisa
    searchInput.addEventListener('keyup', () => {
        const searchTerm = searchInput.value.trim();
        filterPokemons(searchTerm);
    });



    const downloadPokemonImage = (imageUrl, fileName) => {
        fetch(imageUrl)
            .then(response => response.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            })
            .catch(error => {
                console.error('Erro ao fazer o download da imagem:', error);
                alert('Erro ao fazer o download da imagem. Verifique o console para mais detalhes.');
            });
    };

   
    fetchPokemon();
});
