Damage calculator for **Neverwinter Nights** game.

# How To Use?
Before you run the script with `python damage_calculator.py` command, you may want to set some values to reflect the damage calculation of weapon of your choice.
Please see the below.

**Note:** Once you run the script, it may take a while to calculate the damage averages based on targeted ac list and round count.

---

**Total Rounds**

To set the total rounds, you need to find this line and change the number with the rounds you want the calculate average damage:
```python
ROUNDS = 500000
```
Do not forget, you do attacks as much as your **APR** in a round so this script would run simulation of 3 million attacks if 500000 given as value. 
Increased number of rounds would increase the correctness of average data but it would also increase the calculation time. IMO, 500000 is good value.

---
**Weapon Properties**

To set the values related to **weapon**, you need to find this line: *(See the comments on the code for detailed description)*
```python
WEAPON = {
    "name"                : "GMW Naginata", # Weapon name. Just a display thing.
    
    "damage"              : "1d10",         # Weapon's damage dice. If your weapon got 2d4 dice, set it as 2d4.
    
    "damage_bonus"        : 5 + 21,         # Damage bonus added on top of the weapon's damage. In this example, 5 comes from
                                            # GMW scroll and 21 is the STR modifier of the character. Total of 26 damage bonus.
                                            
    "threat_range"        : 19,             # Threat range of weapon. You must take Improved Critical feat into considiration.
                                            # Naginata normally has 20 threat range. But with Improved Critical feat, it 
                                            # becomes 19.
                                            
    "crit_multiplier"     : 2,              # Critical Multiplier of the weapon. If you have a feat that increases your
                                            # Critical Multiplier, you must take it into considiration. For example,
                                            # if you were an WM with 5 or more levels, due to Increased multiplier
                                            # feat that WM gains at level 5, Critical Multiplier of Naginata would be 3.
                                            # So you would need to give 3 as a value in that case.
                                            
    "other_damage_bonus"  : [               # This is the other damage bonus list. What I mean from other damage bonus is item 
                                            # or class related bonuses. Like temporary essence or Hexblade's curse weapon ability. 
                                            # "name" is just a display thing. "damage" is the damage that will be dealt to target. 
                                            # Do not forget to write dice value as string. Such as "1d6". If it is not a dice value
                                            # but instead a direct value, write it as integer. Such as 2. (See below) If you set
                                            # "resistable" to False, defensive essences' of your attack target won't apply to this
                                            # damage type. For example Hexblade's damage bonuses from curse weapon ability can't be 
                                            # resisted by defensive essences.
        {"name" : "Divine", "damage" : "1d6", "resistable" : True},
        {"name" : "Positive", "damage" : 2, "resistable" : False},
        {"name" : "Negative", "damage" : 2, "resistable" : False}
    ]
}
```

---

**Character Properties**

To set the values related your **character**, you need to find this line: (See the comments on the code for detailed description)

```python
CHARACTER = {
    "ab"                    : 50,    # Your first attack's AB. Which is your highest AB. If you are dual-wielding, you need to 
                                     # take it into considiration.
                                     
    "base_apr"              : 6,     # Your BASE APR. Do not count dual-wield APR bonus and APR bonuses from spells like Haste.
                                     # This example's character is monk thus it got 6 APR with monk proficiency weapon (naginata).
                                     
    "dual_wielding"         : False, # If set to True, your APR will be increased by 2 and dual-wielding will taken into account
                                     # when doing calculations.
                                     
    "extra_attack"          : 1,     # Your extra attack bonus from spells like haste and abilities like blinding speed, etc.
                                     # NOTE: If your character have Thundering Rage, it's bonus APR will not be taken into account
                                     # even if you set "thundering_rage" at below to True. Setting it to True only affects
                                     # bonus damage on critical hits. You need to increase "extra_attack" count by 1 in this case.
                                     # For example let's assume you are a barbarian with haste and thundering rage active. Then you
                                     # would have 2 extra attacks and you should have set this "extra_attack" field to 2.
                                     # This example's character is a monk with haste thus I have set this "extra_attack" field to 1.
    
    "overwhelming_critical" : False, # If set to True, it's extra damage on critical hits will be taken into account
                                     # when doing calculations.
                                     
    "thundering_rage"       : False, # If set to True, it's extra damage on critical hits will be taken into account
                                     # when doing calculations.
                                     
    "is_monk"               : True   # If set to True, AB penalty is set to -3 from -5 for consecutively attacks.
}
```

---

**Target Properties**
To set the values related your character's **target**, you need to find this line: (See the comments on the code for detailed description)

```python
TARGET = {
    "ac_list"           : [50, 55, 60, 65, 70], # This is the AC list that attacks will be made against. You can add or
                                                # remove values from this list. For example if you want to make your
                                                # attacks against 30, 35, 40 AC; you would need to set it as [30, 35, 40].
                                                # More AC in the list means increased calculation time.
                                                
    "defensive_essence" : 5,                    # Target's defensive essence value. This value will apply to all damage types that
                                                # is set as resistable. ("resistable" : True). And value of this field will be
                                                # reduced from your other damage bonus.
                                                
    "concealment"       : 50,                   # Target's concealment value. This value may come from spell or abilities like
                                                # Improved Invisibility or Empty Body. Calculation will be done as assuming your
                                                # character have Blind Fight feat.
                                                
    "epic_dodge"        : False,                # If set to True, Epic Dodge will be taken into account when doing calculations.
    
    "crit_immunity"     : False,                # If set to True, target will be immune to critical hits and will be taken into
                                                # account when doing calculations.
                                                
    "physical_immunity" : 0,                    # Physical immunity value of the target. This value repsents a percentage (%).
                                                # For example, if this value was set to 25, calculations would be done as if
                                                # your target had 25% physical immunity.
                                                
    "physical_damage_reduction": 0              # Physical damage reduction value of the target. For example, if this value 
                                                # was set to 10, all of your character's physical damage dealt would be
                                                # reduced by 10.
}
```

---

# Calculation Result Example
When calculation done, script would print the results into console just like below: *(Also script saves the result to the file called **result.txt**)*
```
ROUNDS                             500000

WEAPON NAME                        GMW Naginata
WEAPON DAMAGE                      1d10
WEAPON DAMAGE BONUS                26
WEAPON THREAT RANGE                19
WEAPON CRITICAL HIT MULTIPLIER     2
WEAPON OTHER DAMAGE BONUSES        
    * DIVINE                       1d6
    * POSITIVE                     2
    * NEGATIVE                     2

CHARACTER AB                       50
CHARACTER TOTAL APR                7
CHARACTER IS MONK                  Yes
CHARACTER OVERWHELMING CRITICAL    No
CHARACTER THUNDERING RAGE          No

TARGET DEFENSIVE ESSENCE           5
TARGET CONCEALMENT                 50% (25.00% w/ blind fight)
TARGET EPIC DODGE                  No
TARGET CRITICAL IMMUNITY           No
TARGET PHYSICAL IMMUNITY           0%
TARGET PHYSICAL DAMAGE REDUCTION   0

-=[RESULTS]=-                     

TARGET AC                          20
TOTAL ATTACK                       3500000
TOTAL HIT                          2528149 (72.23% of total attacks)
TOTAL MISS                         971851 (27.77% of total attacks)
    * CONCEALED ATTACKS            838994 (86.33% of total misses)
    * EPIC DODGE                   0 (0.00% of total misses)
TOTAL CRITICAL HIT                 266121 (10.53% of total hits)

TOTAL DAMAGE                       100186362
TOTAL WEAPON DAMAGE                88024548 (87.86% of total damage)
TOTAL OTHER DAMAGE                 12161814 (12.14% of total damage)
    * DIVINE                       984734
    * POSITIVE                     5588540
    * NEGATIVE                     5588540

AVARAGE DAMAGE PER ROUND           200.37

==================================================

TARGET AC                          25
TOTAL ATTACK                       3500000
TOTAL HIT                          2527992 (72.23% of total attacks)
TOTAL MISS                         972008 (27.77% of total attacks)
    * CONCEALED ATTACKS            839304 (86.35% of total misses)
    * EPIC DODGE                   0 (0.00% of total misses)
TOTAL CRITICAL HIT                 266936 (10.56% of total hits)

TOTAL DAMAGE                       100208168
TOTAL WEAPON DAMAGE                88043398 (87.86% of total damage)
TOTAL OTHER DAMAGE                 12164770 (12.14% of total damage)
    * DIVINE                       985058
    * POSITIVE                     5589856
    * NEGATIVE                     5589856

AVARAGE DAMAGE PER ROUND           200.42

==================================================

TARGET AC                          30
TOTAL ATTACK                       3500000
TOTAL HIT                          2527070 (72.20% of total attacks)
TOTAL MISS                         972930 (27.80% of total attacks)
    * CONCEALED ATTACKS            839858 (86.32% of total misses)
    * EPIC DODGE                   0 (0.00% of total misses)
TOTAL CRITICAL HIT                 265302 (10.50% of total hits)

TOTAL DAMAGE                       100112444
TOTAL WEAPON DAMAGE                87963027 (87.86% of total damage)
TOTAL OTHER DAMAGE                 12149417 (12.14% of total damage)
    * DIVINE                       979929
    * POSITIVE                     5584744
    * NEGATIVE                     5584744

AVARAGE DAMAGE PER ROUND           200.22

==================================================

TARGET AC                          35
TOTAL ATTACK                       3500000
TOTAL HIT                          2527486 (72.21% of total attacks)
TOTAL MISS                         972514 (27.79% of total attacks)
    * CONCEALED ATTACKS            839071 (86.28% of total misses)
    * EPIC DODGE                   0 (0.00% of total misses)
TOTAL CRITICAL HIT                 266464 (10.54% of total hits)

TOTAL DAMAGE                       100167483
TOTAL WEAPON DAMAGE                88009476 (87.86% of total damage)
TOTAL OTHER DAMAGE                 12158007 (12.14% of total damage)
    * DIVINE                       982207
    * POSITIVE                     5587900
    * NEGATIVE                     5587900

AVARAGE DAMAGE PER ROUND           200.33

==================================================

TARGET AC                          40
TOTAL ATTACK                       3500000
TOTAL HIT                          2469624 (70.56% of total attacks)
TOTAL MISS                         1030376 (29.44% of total attacks)
    * CONCEALED ATTACKS            840006 (81.52% of total misses)
    * EPIC DODGE                   0 (0.00% of total misses)
TOTAL CRITICAL HIT                 256506 (10.39% of total hits)

TOTAL DAMAGE                       97726067
TOTAL WEAPON DAMAGE                85868949 (87.87% of total damage)
TOTAL OTHER DAMAGE                 11857118 (12.13% of total damage)
    * DIVINE                       952598
    * POSITIVE                     5452260
    * NEGATIVE                     5452260

AVARAGE DAMAGE PER ROUND           195.45

==================================================

TARGET AC                          45
TOTAL ATTACK                       3500000
TOTAL HIT                          2241279 (64.04% of total attacks)
TOTAL MISS                         1258721 (35.96% of total attacks)
    * CONCEALED ATTACKS            840308 (66.76% of total misses)
    * EPIC DODGE                   0 (0.00% of total misses)
TOTAL CRITICAL HIT                 231979 (10.35% of total hits)

TOTAL DAMAGE                       88667828
TOTAL WEAPON DAMAGE                77910339 (87.87% of total damage)
TOTAL OTHER DAMAGE                 10757489 (12.13% of total damage)
    * DIVINE                       864457
    * POSITIVE                     4946516
    * NEGATIVE                     4946516

AVARAGE DAMAGE PER ROUND           177.34

==================================================

TARGET AC                          50
TOTAL ATTACK                       3500000
TOTAL HIT                          1861386 (53.18% of total attacks)
TOTAL MISS                         1638614 (46.82% of total attacks)
    * CONCEALED ATTACKS            840879 (51.32% of total misses)
    * EPIC DODGE                   0 (0.00% of total misses)
TOTAL CRITICAL HIT                 189928 (10.20% of total hits)

TOTAL DAMAGE                       73521108
TOTAL WEAPON DAMAGE                64605190 (87.87% of total damage)
TOTAL OTHER DAMAGE                 8915918 (12.13% of total damage)
    * DIVINE                       710662
    * POSITIVE                     4102628
    * NEGATIVE                     4102628

AVARAGE DAMAGE PER ROUND           147.04

==================================================

TARGET AC                          55
TOTAL ATTACK                       3500000
TOTAL HIT                          1271427 (36.33% of total attacks)
TOTAL MISS                         2228573 (63.67% of total attacks)
    * CONCEALED ATTACKS            841791 (37.77% of total misses)
    * EPIC DODGE                   0 (0.00% of total misses)
TOTAL CRITICAL HIT                 126750 (9.97% of total hits)

TOTAL DAMAGE                       50116653
TOTAL WEAPON DAMAGE                44043088 (87.88% of total damage)
TOTAL OTHER DAMAGE                 6073565 (12.12% of total damage)
    * DIVINE                       480857
    * POSITIVE                     2796354
    * NEGATIVE                     2796354

AVARAGE DAMAGE PER ROUND           100.23

==================================================

TARGET AC                          60
TOTAL ATTACK                       3500000
TOTAL HIT                          740593 (21.16% of total attacks)
TOTAL MISS                         2759407 (78.84% of total attacks)
    * CONCEALED ATTACKS            840754 (30.47% of total misses)
    * EPIC DODGE                   0 (0.00% of total misses)
TOTAL CRITICAL HIT                 70225 (9.48% of total hits)

TOTAL DAMAGE                       29052395
TOTAL WEAPON DAMAGE                25537063 (87.90% of total damage)
TOTAL OTHER DAMAGE                 3515332 (12.10% of total damage)
    * DIVINE                       272060
    * POSITIVE                     1621636
    * NEGATIVE                     1621636

AVARAGE DAMAGE PER ROUND           58.10

==================================================

TARGET AC                          65
TOTAL ATTACK                       3500000
TOTAL HIT                          361477 (10.33% of total attacks)
TOTAL MISS                         3138523 (89.67% of total attacks)
    * CONCEALED ATTACKS            840391 (26.78% of total misses)
    * EPIC DODGE                   0 (0.00% of total misses)
TOTAL CRITICAL HIT                 28613 (7.92% of total hits)

TOTAL DAMAGE                       13969022
TOTAL WEAPON DAMAGE                12287978 (87.97% of total damage)
TOTAL OTHER DAMAGE                 1681044 (12.03% of total damage)
    * DIVINE                       120684
    * POSITIVE                     780180
    * NEGATIVE                     780180

AVARAGE DAMAGE PER ROUND           27.94

==================================================

TARGET AC                          70
TOTAL ATTACK                       3500000
TOTAL HIT                          133433 (3.81% of total attacks)
TOTAL MISS                         3366567 (96.19% of total attacks)
    * CONCEALED ATTACKS            840642 (24.97% of total misses)
    * EPIC DODGE                   0 (0.00% of total misses)
TOTAL CRITICAL HIT                 1828 (1.37% of total hits)

TOTAL DAMAGE                       4827441
TOTAL WEAPON DAMAGE                4260530 (88.26% of total damage)
TOTAL OTHER DAMAGE                 566911 (11.74% of total damage)
    * DIVINE                       25867
    * POSITIVE                     270522
    * NEGATIVE                     270522

AVARAGE DAMAGE PER ROUND           9.65

==================================================
```
