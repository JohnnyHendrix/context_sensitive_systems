# Übung für Kontextsensitive Systeme am KIT SS17
Um die ReactNative-Applikation auszuführen, das Repository klonen und folgende Schritte ausführen:

## Expo-CLI Installation
`npm install -g exp` um `exp` global zu installieren.

## Expo-Server starten
`exp start` zum Starten des Expo-Servers. Es wird der Expo-Client (AppStore, Playstore) benötigt, um die App ausführen zu können.

## Erstellen von neuen Trainingsdaten
- InfluxDB in der `App.js` der ReactNative-Applikation konfigurieren
- Trainingsdaten über die Applikation sammeln

## Erstellen eines neuen Entscheidungsbaums
- InfluxDB im R-Skript konfigurieren
- R-Skript ausführen, um ein neues PMML zu erzeugen
- PMML in den Ordner `pmml2js_with_compound_v_4_3` als `pmml.xml`kopieren
- `pmml2js.html` im Browser öffnen (getestet in Safari)
- Generierten JS-Code kopieren und als `const decisionTree`-Variable in `mobile_app/classifier/DecisionTree.js` setzen
- Ausprobieren!


