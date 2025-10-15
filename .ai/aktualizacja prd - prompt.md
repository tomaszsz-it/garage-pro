Jesteś doświadczonym menedżerem produktu, którego zadaniem jest pomoc w aktualizacji kompleksowego dokumentu wymagań projektowych (PRD) na podstawie dostarczonych informacji. Twoim celem jest wygenerowanie listy pytań i zaleceń, które zostaną wykorzystane w kolejnym promptowaniu do aktualizacji pełnego PRD.

Prosimy o uważne zapoznanie się z poniższymi informacjami:

<initial_project_description>
### Główny problem
Klienci mają trudność w szybkim znalezieniu dostępnego mechanika dla prostych napraw, takich jak wymiana oleju. Właściciel warsztatu chce wypełnić godziny pracy swoich pracowników. Właściciel warsztatu chce pozyskiwać klientów bez zaangażowania - Właściciel auta może sam znależć dostępny warsztat ktktóry wykona naprawę.
Priorytetem ma być bardzo szybka realizacja usługi.

### Najmniejszy zestaw funkcjonalności
- Wyszukanie dostępnego terminu na wybraną usługę w Warsztacie samochodowym
- Manualne wprowadzanie dostępności pracowników i stoisk warsztatowych
- Rezerwacja czasu pracownika. 
- Typ naprawy jest skorelowany z planowanym czasem naprawy, np wymiana oleju to 30 min. Rezerwujemy tak naprawdę dostępność mechanika i stoiska w warsztacie 
- Prosty system rezerwacji naprawy. System prezentuje wszystkie dostępne terminy u wszystkich pracowników.  Możliwość zarządzania naprawą - CRUD dla naprawy
- Sekreatriat warsztatu może nadal przyjmować rezerwacjie telofoniczne
- Klient jest informowany o możliwych koniecznych najbliższych naprawach. System w oparciu o AI dostarcza predyckje, informacje na temat auta, w oparciu o dane auta, dane naprawy, historię napraw oraz wiedzę AI. Np. Klient wymienia filtr oleju i olej a system mówi że dla tego auta maksymalnie co 3 lata powinien być wymieniany filtr paliwa, jeśli nie był wymieniany od 3 lat czy wymienić filtr paliwa razem z wymianą filtru oleju. 


### Co NIE wchodzi w zakres MVP
- Stoiska wrsztatowe do deykowanych napraw, narazie każde stanowisko obsłuhuje każdy rodzaj naprawy.
- Skomplikowane naprawy wymgające więcej niż jednego mechanika
- Aplikacje mobilne (na początek tylko web)
- Integracje z innymi serwisami
- Notyfikacje do klientów oraz marketing

### Kryteria sukcesu
- Ponad 50% rezerwacji odbywa się drogą elektroniczną przez Warsztat
</initial_project_description>

<new_requirements>
Zobacz prd.md, jest iniclajlna wersja prd z dodanymi informacjami o zmianach, jest to zdefiniowane w <scope_update> W oparciu o te informacje zaktualizujesz prd.md, to znaczy aktualizujesz informacje w prd oraz usuniesz </scope_update> 
<new_requirements>


Przeanalizuj dostarczone informacje, koncentrując się na aspektach istotnych dla tworzenia PRD. Rozważ następujące kwestie:
<prd_analysis>
1. Zidentyfikuj główny problem, który produkt ma rozwiązać.
2. Określ kluczowe funkcjonalności MVP.
3. Rozważ potencjalne historie użytkownika i ścieżki korzystania z produktu.
4. Pomyśl o kryteriach sukcesu i sposobach ich mierzenia.
5. Oceń ograniczenia projektowe i ich wpływ na rozwój produktu.
</prd_analysis>

Na podstawie analizy wygeneruj listę 5 pytań i zaleceń w formie łączonej (pytanie + zalecenie). Powinny one dotyczyć wszelkich niejasności, potencjalnych problemów lub obszarów, w których potrzeba więcej informacji, aby zaktualizować skuteczny PRD. Rozważ pytania dotyczące:

1. Szczegółów problemu użytkownika
2. Priorytetyzacji funkcjonalności
3. Oczekiwanego doświadczenia użytkownika
4. Mierzalnych wskaźników sukcesu
5. Potencjalnych ryzyk i wyzwań
6. Harmonogramu i zasobów

<pytania>
Wymień tutaj swoje pytania i zalecenia, ponumerowane dla jasności:

Przykładowo:
1. Czy już od startu projektu planujesz wprowadzenie płatnych subskrypcji?

Rekomendacja: Pierwszy etap projektu może skupić się na funkcjonalnościach darmowych, aby przyciągnąć użytkowników, a płatne funkcje można wprowadzić w późniejszym etapie.
</pytania>

Kontynuuj ten proces, generując nowe pytania i rekomendacje w oparciu o odpowiedzi użytkownika, dopóki użytkownik wyraźnie nie poprosi o podsumowanie.

Pamiętaj, aby skupić się na jasności, trafności i dokładności wyników. Nie dołączaj żadnych dodatkowych komentarzy ani wyjaśnień poza określonym formatem wyjściowym.

Pracę analityczną należy przeprowadzić w bloku myślenia. Końcowe dane wyjściowe powinny składać się wyłącznie z pytań i zaleceń i nie powinny powielać ani powtarzać żadnej pracy wykonanej w sekcji prd_analysis.