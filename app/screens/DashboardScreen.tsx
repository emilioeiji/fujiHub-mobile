import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
  const handlePress = (menu: string) => {
    Alert.alert(`Você clicou em: ${menu}`);
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={require("../assets/fujihub-main.png")} // coloque a logo em /assets
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Título */}
      <Text style={styles.title}>Bem-vindo ao FujiHub</Text>

      {/* Menus */}
      <View style={styles.menuContainer}>
        {["Produtos", "Serviços", "Contato", "Sobre nós"].map((menu) => (
          <TouchableOpacity
            key={menu}
            style={styles.menuButton}
            onPress={() => handlePress(menu)}
          >
            <Text style={styles.menuText}>{menu}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  logo: {
    width: 220,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#333",
  },
  menuContainer: {
    width: "100%",
  },
  menuButton: {
    backgroundColor: "#e60023", // vermelho estilizado
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: "center",
  },
  menuText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
