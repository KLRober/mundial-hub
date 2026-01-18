export default function ProdePage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
            <h1 className="text-2xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
                Predicciones
            </h1>
            <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
                <p className="text-muted-foreground">
                    El sistema de predicciones estará disponible próximamente.
                    ¡Prepárate para demostrar cuánto sabes de fútbol!
                </p>
            </div>
        </div>
    );
}
