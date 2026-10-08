# Requirements Document

## Introduction

Diese Funktion ermöglicht einer Kundin oder einem Kunden der Schweizerischen Post, den CO2-Fussabdruck des Paketversands zu verstehen. Die Kundin oder der Kunde wählt für ein Paket ein Service-Level (Economy, Priority oder Kurier), gibt Paketgewicht sowie Herkunfts- und Zielgebiet an und erhält eine geschätzte CO2-Emission pro Paket sowie einen Gesamtwert über alle Pakete. Das System ermittelt dazu aus einem gemockten Netz von Paketzentren die effizienteste Transportroute und berechnet die Emission aus den Routenabschnitten und den Transportart-Emissionsfaktoren. Die Funktion zeigt zusätzlich die verwendeten Emissionsfaktoren, Routenabschnitte und Annahmen an, damit die Kundin oder der Kunde nachvollziehen kann, wie die Schätzung entstanden ist.

Dies ist ein Prototyp. Emissionsfaktoren, Transportarten, Distanzen und das Paketzentren-Netz sind mit repräsentativen Werten gemockt und stammen nicht aus produktiven Systemen der Schweizerischen Post. Die Standorte der Paketzentren beruhen auf öffentlich recherchierten realen Standorten der Schweizerischen Post (drei nationale Paketzentren in Härkingen, Daillens und Frauenfeld sowie regionale Paketzentren wie Ostermundigen und Cadenazzo). Die Distanzen zwischen den Zentren und die Emissionsfaktoren je Transportart sind jedoch gemockt. Die Schätzungen sind indikativ und sind keine zertifizierten CO2-Bilanzwerte.

## Glossary

- **System**: Die Prototyp-Anwendung zum CO2-Fussabdruck der Schweizerischen Post, einschliesslich Benutzeroberfläche und Berechnungslogik.
- **Customer**: Eine Person, die den Paketversand der Schweizerischen Post nutzt und mit dem System CO2-Schätzungen ansieht.
- **Package**: Ein einzelnes versendetes Paket, konfiguriert durch die Customer mit Paketgewicht, Origin, Destination und einem Service_Level.
- **Service_Level**: Die gewählte Versandstufe eines Package. Für diesen Prototyp umfasst die Menge {Economy, Priority, Kurier}, wobei Economy dem Angebot PostPac Economy und Priority dem Angebot PostPac Priority entspricht.
- **Shipment_Attribute**: Eine von der Customer bereitgestellte Eingabe, die den CO2_Estimate beeinflusst (Paketgewicht in Gramm, Origin und Destination).
- **Origin**: Das von der Customer angegebene Herkunftsgebiet eines Package, aus dem das System das Eingangs-Paketzentrum ableitet.
- **Destination**: Das von der Customer angegebene Zielgebiet eines Package, aus dem das System das Ausgangs-Paketzentrum ableitet.
- **Parcel_Center**: Ein Paketzentrum der Schweizerischen Post im gemockten Netz. Das Netz umfasst drei nationale Paketzentren (Härkingen, Daillens, Frauenfeld) und regionale Paketzentren (einschliesslich Ostermundigen und Cadenazzo). Die Standorte beruhen auf öffentlich recherchierten realen Standorten; die Distanzen sind gemockt.
- **Transport_Mode**: Die Transportart eines Route_Segment. Für diesen Prototyp umfasst die Menge {Lkw, Rail, E_Trike, Car}, wobei Lkw dem Lastwagen, Rail der Bahn, E_Trike dem E-Trike und Car dem Pkw für den Kurier entspricht.
- **Transport_Route**: Die vom System ermittelte Route eines Package durch das Parcel_Center-Netz, bestehend aus einer geordneten Folge von Route_Segment-Elementen.
- **Route_Segment**: Ein Abschnitt einer Transport_Route mit einer Distanz in Kilometern und genau einer Transport_Mode. Eine Transport_Route besteht aus den Abschnitten Aufgabe → Eingangs-Parcel_Center → Hauptlauf zwischen Parcel_Center → Ausgangs-Parcel_Center → Zustellung.
- **Emission_Factor**: Ein gemockter numerischer Wert in Gramm CO2-Äquivalent je Tonnen-Kilometer, der genau einer Transport_Mode zugeordnet ist.
- **CO2_Estimate**: Ein berechneter Wert in Gramm CO2-Äquivalent, der den geschätzten Fussabdruck eines Package darstellt.
- **Total_Footprint**: Die Summe der CO2_Estimate-Werte aller Package-Elemente, die die Customer in einer Sitzung hinzugefügt hat.
- **Estimation_Engine**: Die Systemkomponente, die aus Shipment_Attribute-Werten, der Transport_Route und den Emission_Factor-Werten einen CO2_Estimate berechnet.
- **Route_Network**: Der gemockte Datensatz, der die Parcel_Center-Elemente, die Verbindungen zwischen ihnen, die Distanzen in Kilometern und die je Verbindung verfügbaren Transport_Mode-Werte abbildet.
- **Emission_Factor_Catalog**: Der gemockte Datensatz, der jeder Transport_Mode ihren Emission_Factor zuordnet.

## Requirements

### Requirement 1: Service-Level wählen

**User Story:** Als Customer möchte ich das Service-Level für ein Paket wählen, damit ich den CO2-Fussabdruck für die gewünschte Versandstufe schätzen kann.

#### Acceptance Criteria

1. WHEN die Customer das System öffnet, THE System SHALL genau drei Service_Level-Optionen mit den Bezeichnungen Economy, Priority und Kurier anzeigen, wobei keine Option vorausgewählt ist.
2. WHEN die Customer ein Service_Level wählt, THE System SHALL ausschliesslich die Shipment_Attribute-Eingaben anzeigen, die für das gewählte Service_Level gelten.
3. WHEN die Customer nach einer vorherigen Auswahl ein anderes Service_Level wählt, THE System SHALL die zuvor eingegebenen Shipment_Attribute-Werte unverändert beibehalten.
4. IF die Customer fortfahren will, ohne ein Service_Level gewählt zu haben, THEN THE System SHALL eine Meldung anzeigen, die die fehlende Service_Level-Auswahl benennt, SHALL auf der aktuellen Ansicht bleiben und SHALL alle aktuellen Shipment_Attribute-Eingaben beibehalten.

### Requirement 2: Paketdetails angeben

**User Story:** Als Customer möchte ich die Details meines Pakets eingeben, damit die Schätzung meine tatsächliche Sendung abbildet.

#### Acceptance Criteria

1. WHEN ein Service_Level gewählt ist, THE System SHALL von der Customer ein Paketgewicht in Gramm, ein Origin und eine Destination anfordern.
2. IF die Customer ein Paketgewicht kleiner als 1 Gramm oder grösser als 30000 Gramm eingibt, THEN THE System SHALL eine Meldung anzeigen, die den zulässigen Bereich von 1 bis 30000 Gramm nennt, und SHALL die Eingabe ablehnen.
3. IF die Customer ein nicht-numerisches Paketgewicht eingibt, THEN THE System SHALL eine Meldung anzeigen, die einen numerischen Wert verlangt, und SHALL die Eingabe ablehnen.
4. WHEN die Customer ein Origin wählt, THE System SHALL genau ein Herkunftsgebiet aus dem Route_Network annehmen.
5. WHEN die Customer eine Destination wählt, THE System SHALL genau ein Zielgebiet aus dem Route_Network annehmen.
6. IF die Customer den Shipment_Attribute-Satz mit leerem oder fehlendem Paketgewicht absendet, THEN THE System SHALL eine Meldung anzeigen, die ein Paketgewicht verlangt, und SHALL die Eingabe ablehnen.
7. WHEN die Customer ein Paketgewicht im Bereich von 1 bis 30000 Gramm, genau ein Origin und genau eine Destination bereitstellt, THE System SHALL den Shipment_Attribute-Satz annehmen und SHALL diesen für die Estimation_Engine bereitstellen.

### Requirement 3: Transportroute ermitteln

**User Story:** Als Customer möchte ich die ermittelte Transportroute meines Pakets durch die Paketzentren sehen, damit ich nachvollziehen kann, über welche Abschnitte und Transportarten die Emission entsteht.

#### Acceptance Criteria

1. WHEN ein gültiger Shipment_Attribute-Satz mit Origin und Destination vorliegt, THE Estimation_Engine SHALL aus dem Route_Network die Transport_Route mit der geringsten CO2-Gesamtemission ermitteln.
2. THE Estimation_Engine SHALL jede Transport_Route als geordnete Folge von Route_Segment-Elementen in der Reihenfolge Aufgabe, Eingangs-Parcel_Center, Hauptlauf, Ausgangs-Parcel_Center und Zustellung bilden.
3. THE Estimation_Engine SHALL jedem Route_Segment genau eine Distanz in Kilometern und genau eine Transport_Mode aus dem Route_Network zuweisen.
4. WHERE das gewählte Service_Level Kurier ist, THE Estimation_Engine SHALL eine Transport_Route als Pkw-Direktfahrt mit der Transport_Mode Car zwischen Origin und Destination bilden.
5. WHERE das gewählte Service_Level Priority ist, THE Estimation_Engine SHALL für den Hauptlauf zwischen den Parcel_Center-Elementen die Transport_Mode Lkw (Strasse) bevorzugen, sofern das Route_Network für diese Verbindung Lkw bereitstellt.
6. WHERE das gewählte Service_Level Economy ist, THE Estimation_Engine SHALL für den Hauptlauf zwischen den Parcel_Center-Elementen die Transport_Mode Rail bevorzugen, sofern das Route_Network für diese Verbindung Rail bereitstellt.
7. IF das Route_Network keine Verbindung zwischen dem Origin und der Destination enthält, THEN THE System SHALL eine Meldung anzeigen, die angibt, dass keine Route für diese Kombination verfügbar ist, und SHALL die eingegebenen Shipment_Attribute-Werte beibehalten.

### Requirement 4: CO2-Schätzung für ein Paket berechnen

**User Story:** Als Customer möchte ich die geschätzte CO2-Emission eines einzelnen Pakets sehen, damit ich dessen Umweltwirkung verstehe.

#### Acceptance Criteria

1. WHEN die Customer ein Package mit einem Paketgewicht zwischen 1 Gramm und 30000 Gramm, einem Origin und einer Destination absendet, die eine gültige Transport_Route im Route_Network ergeben, THE Estimation_Engine SHALL innerhalb von 2 Sekunden einen CO2_Estimate in Gramm CO2-Äquivalent berechnen.
2. THE Estimation_Engine SHALL den CO2_Estimate als Summe über alle Route_Segment-Elemente berechnen, wobei jeder Summand das Produkt aus dem Paketgewicht, der Segment-Distanz in Kilometern und dem Emission_Factor der Transport_Mode dieses Route_Segment ist.
3. WHEN der CO2_Estimate berechnet ist, THE System SHALL den CO2_Estimate auf das nächste ganze Gramm CO2-Äquivalent gerundet anzeigen, wobei Werte von genau 0,5 Gramm aufgerundet werden.
4. IF der Emission_Factor_Catalog für eine Transport_Mode der ermittelten Transport_Route keinen Emission_Factor enthält, THEN THE System SHALL eine Meldung anzeigen, die angibt, dass für diese Transportart keine Schätzung verfügbar ist, und SHALL die eingegebenen Shipment_Attribute-Werte beibehalten.
5. IF die Customer ein Package mit einem Paketgewicht absendet, das kleiner als 1 Gramm, grösser als 30000 Gramm, fehlend oder nicht-numerisch ist, THEN THE Estimation_Engine SHALL das Package ablehnen, ohne einen CO2_Estimate zu berechnen, und THE System SHALL eine Meldung anzeigen, die das ungültige Paketgewicht benennt und den zulässigen Bereich nennt.

### Requirement 5: Mehrere Pakete hinzufügen und Gesamtwert anzeigen

**User Story:** Als Customer möchte ich mehrere Pakete kombinieren, damit ich den gesamten CO2-Fussabdruck meines Paketversands sehe.

#### Acceptance Criteria

1. WHEN die Customer ein berechnetes Package bestätigt, THE System SHALL das Package der aktuellen Sitzungsliste hinzufügen, bis zu einem Höchstwert von 50 Package-Elementen.
2. IF die Customer ein Package bestätigt, während die Sitzungsliste bereits 50 Package-Elemente enthält, THEN THE System SHALL das Hinzufügen ablehnen, die bestehende Sitzungsliste unverändert beibehalten und eine Meldung anzeigen, die angibt, dass die Höchstzahl der Sitzungsliste erreicht ist.
3. WHILE die Sitzungsliste ein oder mehrere Package-Elemente enthält, THE System SHALL jedes Package mit seinem Service_Level, seinen Shipment_Attribute-Werten, seiner Transport_Route und seinem CO2_Estimate in Gramm CO2-Äquivalent anzeigen.
4. WHILE die Sitzungsliste ein oder mehrere Package-Elemente enthält, THE System SHALL den Total_Footprint als Summe aller CO2_Estimate-Werte in Gramm CO2-Äquivalent anzeigen.
5. WHEN die Customer ein Package aus der Sitzungsliste entfernt, THE System SHALL den Total_Footprint als Summe der CO2_Estimate-Werte der verbleibenden Package-Elemente neu berechnen und den aktualisierten Total_Footprint innerhalb von 1 Sekunde anzeigen.
6. WHILE die Sitzungsliste null Package-Elemente enthält, THE System SHALL den Total_Footprint als 0 Gramm CO2-Äquivalent anzeigen.

### Requirement 6: Emissionsfaktoren und Annahmen erklären

**User Story:** Als Customer möchte ich die Emissionsfaktoren, Routenabschnitte und Annahmen hinter der Schätzung sehen, damit ich beurteilen kann, wie der Wert entstanden ist.

#### Acceptance Criteria

1. WHEN das System einen CO2_Estimate anzeigt, THE System SHALL für jedes Route_Segment der zugehörigen Transport_Route die Transport_Mode, die Distanz in Kilometern und den angewandten Emission_Factor mit seiner Masseinheit anzeigen.
2. THE System SHALL zusammen mit jedem angezeigten CO2_Estimate und Total_Footprint eine Erklärung anzeigen, dass die CO2_Estimate-Werte indikative Prototyp-Werte auf Basis gemockter Emission_Factor- und Route_Network-Daten sind.
3. WHERE die Customer die Herkunft der Daten anfordert, THE System SHALL eine Beschreibung anzeigen, die angibt, dass die Standorte der Parcel_Center-Elemente auf öffentlich recherchierten realen Standorten der Schweizerischen Post (Härkingen, Daillens, Frauenfeld sowie regionale Paketzentren) beruhen, während die Distanzen und die Emission_Factor-Werte je Transport_Mode gemockt sind.
4. IF der Emission_Factor für eine Transport_Mode eines angezeigten CO2_Estimate nicht aus dem Emission_Factor_Catalog abgerufen werden kann, THEN THE System SHALL anzeigen, dass die Emissionsfaktor-Angaben für dieses Package nicht verfügbar sind, und SHALL die übrigen verfügbaren CO2_Estimate-Werte weiterhin anzeigen.

### Requirement 7: Geführter Ablauf

**User Story:** Als Customer möchte ich Schritt für Schritt durch die Schätzung geführt werden, damit ich sie ohne Vorwissen zur CO2-Bilanzierung abschliessen kann.

#### Acceptance Criteria

1. WHEN die Customer eine Schätzung startet, THE System SHALL eine Dreischritt-Folge in der festen Reihenfolge Schritt 1 Service_Level wählen, Schritt 2 Paketdetails mit Origin und Destination eingeben, Schritt 3 Transport_Route und CO2_Estimate ansehen anzeigen.
2. WHILE die Customer sich auf einem Schritt befindet, THE System SHALL die aktuelle Schrittnummer, die Gesamtzahl von 3 Schritten und die Anzahl verbleibender Schritte anzeigen.
3. WHEN die Customer einen Schritt mit allen erforderlichen Eingaben abschliesst, die die Validierung bestehen, THE System SHALL den Übergang zum nächsten Schritt freigeben.
4. IF die Customer von einem Schritt mit einer oder mehreren fehlenden oder ungültigen erforderlichen Eingaben weitergehen will, THEN THE System SHALL den Übergang zum nächsten Schritt blockieren und eine Meldung anzeigen, die benennt, welche Eingaben korrigiert werden müssen, und dabei die eingegebenen Werte beibehalten.
5. WHEN die Customer zu einem vorherigen Schritt zurückkehrt, THE System SHALL diesen Schritt mit den zuvor eingegebenen Werten unverändert anzeigen.
6. IF die Customer zu einem Schritt über den aktuell weitesten abgeschlossenen Schritt hinaus navigieren will, THEN THE System SHALL die Navigation blockieren und die Customer auf dem aktuellen Schritt halten.

### Requirement 8: Service-Level vergleichen

**User Story:** Als Customer möchte ich für dasselbe Paket die Service_Level gegenüberstellen, damit ich sehe, welches Service_Level welchen CO2_Estimate ergibt, und das passende auswählen kann.

#### Acceptance Criteria

1. WHEN ein gültiger Shipment_Attribute-Satz vorliegt, THE System SHALL für dasselbe Paketgewicht, dasselbe Origin und dieselbe Destination den CO2_Estimate je Service_Level (Economy, Priority, Kurier) gleichzeitig anzeigen.
2. THE System SHALL je verglichenem Service_Level dessen Transport_Route und dessen CO2_Estimate in Gramm CO2-Äquivalent anzeigen.
3. WHERE mindestens ein Service_Level einen CO2_Estimate ergibt, THE System SHALL das Service_Level mit dem geringsten CO2_Estimate hervorheben.
4. IF für ein Service_Level keine Route verfügbar ist oder ein Emission_Factor fehlt, THEN THE System SHALL für dieses Service_Level die entsprechende Meldung anzeigen, SHALL es nicht als geringsten CO2_Estimate hervorheben und SHALL die übrigen Service_Level weiterhin vergleichbar anzeigen.
5. WHEN die Customer in der Vergleichsansicht ein Service_Level auswählt, THE System SHALL das zugehörige Package mit genau diesem Service_Level und seinem CO2_Estimate der Sitzungsliste hinzufügen, im Rahmen der bestehenden Höchstzahl von 50 Package-Elementen.
