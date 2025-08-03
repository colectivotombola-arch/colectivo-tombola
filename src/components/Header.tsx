import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-foreground">
              PROYECTOS{" "}
              <span className="text-primary bg-gradient-aqua bg-clip-text text-transparent">
                FLORES
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              Cumpliendo sueños
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              Iniciar Sesión
            </Button>
            <Button className="bg-gradient-aqua hover:shadow-aqua transition-all duration-300">
              Registrarse
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;