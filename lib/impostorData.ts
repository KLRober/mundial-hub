export const impostorCategories = [
    {
        id: 'players',
        name: 'Jugadores Leyenda',
        words: ['Messi', 'Cristiano Ronaldo', 'Maradona', 'Pelé', 'Zidane', 'Ronaldinho', 'Cruyff', 'Ronaldo Nazário']
    },
    {
        id: 'teams',
        name: 'Selecciones',
        words: ['Argentina', 'Brasil', 'Francia', 'Alemania', 'Italia', 'España', 'Inglaterra', 'Uruguay']
    },
    {
        id: 'stadiums',
        name: 'Estadios',
        words: ['Maracaná', 'Camp Nou', 'Bernabéu', 'Wembley', 'Azteca', 'La Bombonera', 'Old Trafford', 'San Siro']
    },
    {
        id: 'roles',
        name: 'Posiciones',
        words: ['Arquero', 'Defensor', 'Mediocampista', 'Delantero', 'Árbitro', 'DT', 'Suplente', 'Capitán']
    },
    {
        id: 'actions',
        name: 'Acciones de Juego',
        words: ['Penal', 'Tiro Libre', 'Córner', 'Gol', 'Tarjeta Roja', 'VAR', 'Offside', 'Lateral']
    }
];

export function getRandomWord() {
    const category = impostorCategories[Math.floor(Math.random() * impostorCategories.length)];
    const word = category.words[Math.floor(Math.random() * category.words.length)];
    return { category: category.name, word };
}
