class Roll {
  constructor(num, sides) {
    this.num = num;
    this.sides = sides;
  }

  roll(modifier) {
    let rolled_values = []
    for (let i = 0; i < this.num; i++) {
      let value = Math.ceil(Math.random() * this.sides);
      rolled_values.push(value);
    }
    let total = Math.sum(rolled_values) + modifier;
    return RollResults(value, rolled_values, _isMax(roll_result, modifier), _isMin(roll_result, modifier));
  }

  max() {
    return this.num * this.sides;
  }

  min() {
    return this.num;
  }

  _isMax(roll_result, modifier) {
    return roll_result === this.max() + modifier;
  }

  _isMin(roll_result, modifier) {
    return roll_result === this.min() + modifier;
  }
}

class RollResults {
  constructor(total, values, is_max, is_min) {
    this.total = total;
    this.values = values;
    this.is_max = is_max;
    this.is_min = is_min;
  }
}

class RollEntry {
  constructor(name, modifier, damage_modifier) {
    this.name = name;
    this.modifier = modifier;
    this.damage_modifier = damage_modifier;
  }
}

class Rollset {
  constructor(name, roll, initiative_bonus=0, damage_roll=null) {
    this.name = name;
    this.roll = roll;
    this.initiative_bonus = initiative_bonus;
    this.initiative = null;
    this.damage_roll = damage_roll;
    this.entries = []
  }

  addEntry(name, modifier, damage_modifier=null) {
    if (damage_modifier !== null && !this.hasDamage()) {
      throw Exception("Can't add damage to RollGroup that doesn't have damage!");
    }
    this.entries.push(new RollEntry(name, modifier, damage_modifier));
  }

  getRollResults() {
    return this._getRollResults(this.roll, this.entries.map(x => x.modifier));
  }

  getDamageRollResults() {
    if (!this.hasDamage()) {
      return null;
    }
    return this._getRollResults(this.damage_roll, this.entries.map(x => x.damage_modifier));
  }

  hasDamage() {
    return this.damage_roll !== null;
  }

  numEntries() {
    return this.entries.length;
  }

  _getRollResults(roll, modifiers) {
    let results = []
    for (const modifier of modifiers) {
      results.push(roll.roll(modifier));
    }
    return results;
  }

  rollInitiative() {
    let initiative = new Roll(1, 20).roll() + this.initiative_bonus;
    this.initiative = initiative;
    return initiative;
  }
}

var rollsets = [];

$(document).ready(function() {

  // $("#add_new_rollset").click(add_rollset);

  let rollset = _add_rollset("roll", "Goblin Attacks", 1, 20);
  // _add_roll_to_rollset(rollset, "Goblin Warrior", 10);
  // _add_roll_to_rollset(rollset, "Goblin Wizard", -10);

  let rollset2 = _add_rollset("attack", "Goblin Attacks w/ Damage", 1, 20, 3, 2, 8);
  // _add_roll_to_rollset(rollset2, "Goblin Warrior", 3);
  // _add_roll_to_rollset(rollset2, "Goblin Wizard", -2);

  // add_rollset();
});

let add_rollset = function(e) {
  let rollset_type_input = $("#rollset_builder_type");
  let rollset_name_input = $("#rollset_builder_name");
  let rollset_dice_input = $("#rollset_builder_dice");
  let rollset_sides_input = $("#rollset_builder_sides");
  let rollset_damage_dice_input = $("#rollset_builder_damage_dice");
  let rollset_damage_sides_input = $("#rollset_builder_damage_sides");
  let rollset_initiative_bonus_input = $("#rollset_builder_initiative_bonus");
  let type = rollset_type_input.val();
  let name = rollset_name_input.val();
  let dice = rollset_dice_input.val();
  let sides = rollset_sides_input.val();
  let damage_dice = rollset_damage_dice_input.val();
  let damage_sides = rollset_damage_sides_input.val();
  let initiative_bonus = rollset_initiative_bonus_input.val();
  rollset_name_input.val("");
  rollset_dice_input.val("");
  rollset_sides_input.val("");
  rollset_damage_dice_input.val("");
  rollset_damage_sides_input.val("");
  rollset_initiative_bonus_input.val("");
  let rollset_index = self.rollsets.length;
  if (!name) {
    name = "Rollset " + String(rollset_index);
  }
  if (!dice) {
    dice = 1;
  }
  if (!sides) {
    sides = 20;
  }
  if (!damage_dice) {
    damage_dice = 2;
  }
  if (!damage_sides) {
    damage_sides = 8;
  }
  _add_rollset(type, name, dice, sides, initiative_bonus, damage_dice, damage_sides);
};

let _add_rollset = function(type, name, dice, sides, initiative_bonus, damage_dice, damage_sides) {
  let rollset_index = self.rollsets.length;
  let rollset = _add_rollset_obj(type, name, dice, sides, initiative_bonus, damage_dice, damage_sides);
  _add_rollset_dom(rollset, rollset_index);

}

var check_enter_rollset = function(event) {
    if (event.keyCode == 13) {
        add_rollset();
    }
}

let _add_rollset_obj = function(type, name, dice, sides, initiative_bonus, damage_dice, damage_sides) {
  let roll = new Roll(dice, sides);
  let rollgroup = null;
  if (type === "attack") {
    let damage_roll = new Roll(damage_dice, damage_sides);
    rollset = new Rollset(name, roll, initiative_bonus, damage_roll);
  } else {
    rollset = new Rollset(name, roll);
  }
  rollsets.push(rollset);
  return rollset;
}

let _add_rollset_dom = function(rollset, rollset_index) {
  let rollsets_dom = $("#rollsets");

  let newrollset = $("#rollset_template").clone();
  newrollset.removeAttr("id");
  newrollset.attr("data-index", rollset_index);

  newrollset.find(".rollset_name").text(rollset.name);

  let roll_summary = newrollset.find(".roll_summary").first();
  let damage_summary = newrollset.find(".damage_summary").first();

  let roll_summary_text = `Roll: ${rollset.roll.num}d${rollset.roll.sides}`;
  roll_summary.text(roll_summary_text);
  if (rollset.hasDamage()) {
    damage_summary_text = `Dmg:  ${rollset.damage_roll.num}d${rollset.damage_roll.sides}`;
    damage_summary.text(damage_summary_text);
  } else {
    damage_summary.css("display", "none");
  }

  rollsets_dom.append(newrollset);
  $("#rollsets .remove_row").off("click");
  $("#rollsets .remove_row").click(remove_rollset);
  $("#rollsets .add_roll").off("click");
  $("#rollsets .add_roll").click(add_roll_to_rollset);
  $("#rollsets .roll_button").off("click");
  $("#rollsets .roll_button").click(multiroll);
  $("#rollsets .roll_initiative_button").off("click");
  $("#rollsets .roll_initiative_button").click(rollInitiative);
  $("#rollsets .rollset_roll_group_initiative").off("click");
  $("#rollsets .rollset_roll_group_initiative").click(rollGroupInitiative);
  $("#rollsets .roll_name").off("keypress");
  $("#rollsets .roll_name").keypress(checkEnterRoll);
  $("#rollsets .roll_modifier").off("keypress");
  $("#rollsets .roll_modifier").keypress(checkEnterRoll);

  return newrollset;
};

var _get_roll_placeholder = function() {
  let roll_placeholder = $("#roll_template").clone();
  roll_placeholder.removeAttr("id");
  roll_placeholder.addClass("placeholder");
  roll_placeholder.css("visibility", "hidden");

  return roll_placeholder;
}

var checkEnterRoll = function(e) {
  if (event.keyCode == 13) {
      add_roll_to_rollset(e);
  }
}

var rollGroupInitiative = function(e) {
  let rollset = $(event.target).parents(".rollset").first();
  let index = Number(rollset.data("index"));
  let initiative = rollsets[index].rollInitiative();
  rollset.find(".rollset_group_initiative").first().text("[" + String(initiative) + "]");
}

var rollInitiative = function(e) {
  let rollset = $(event.target).parents(".rollset").first();
  let index = Number(rollset.data("index"));
  let initiative = rollsets[index].rollInitiative();
  rollset.find(".rollset_group_initiative").text("[" + String(initiative) + "]");
}

// var forEachRollsetEntry = function(cb) {
var setRollColors = function(elem, roll_result) {
  if (roll_result.is_max) {
    elem.css('color', 'red');
  } else if (roll_result.is_min) {
    elem.css('color', 'blue');
  } else {
    elem.css('color', 'black');
  }
}

var multiroll = function(e) {
  let parent = $(event.target).parents(".rollset").first();
  let index = Number(parent.data("index"));
  let rollset = rollsets[index];

  let roll_results = rollset.getRollResults();
  let damage_results = rollset.getDamageRollResults();

  if (roll_results.values.length === 0) {
    return;
  }

  let high = Math.max(...roll_results.map(x => x.total));
  let low = Math.min(...roll_results.map(x => x.total));

  let roll_result_containers = parent.find(".roll_result_container");
  let result_rolls = parent.find(".result_div .result.rolls");
  let best_dom = parent.find(".roll_result_container .best").first();
  let worst_dom = parent.find(".roll_result_container .worst").first();

  best_dom.text(String(high));
  worst_dom.text(String(low));

  let i = 0;
  // Loop over all rollset elements
  $.each(roll_result_containers, function(key, value) {
    let element = $(value);
    let roll_summary = element.find(".roll_summary").first();
    roll_summary.text(roll_results[i].total)
    setRollColors(roll_summary, roll_results[i]);

    let roll_dice = element.find(".roll_rolls").first();
    roll_dice.text(`[${roll_results[i].values}]`);

    if (damage_results !== null) {
      let damage_summary = element.find(".damage_summary").first();
      damage_summary.text(damage_results[i].total)
      setRollColors(damage_summary, damage_results[i]);

      let damage_dice = element.find(".damage_rolls").first();
      damage_dice.text(`[${damage_results[i].values}]`);
    }
    i++;
  });
}

var remove_roll = function(e) {
  let parent = $(event.target).parent(".roll");
  let index = Number(parent.data("index"));
  let rollset_dom = parent.parents(".rollset");
  let rollset_index = Number(rollset_dom.data("index"));
  let grandparent = parent.parent();

  parent.remove();
  console.log(grandparent.children(".roll").length);
  if (!grandparent.children(".roll").length == 0) {
    let roll_placeholder = _get_roll_placeholder();
    grandparent.append(roll_placeholder);
  }
}

var remove_rollset = function(e) {
  if (!confirm("Are you sure you want to remove this rollset?")) {
    return;
  }
  let parent = $(event.target).parents(".rollset");
  let index = Number(parent.data("index"));
  parent.remove();
  rollsets.splice(index, 1)
}

var add_roll_to_rollset = function(e) {
  let rollset_dom = $(event.target).parent(".rollset");
  let roll_name = rollset_dom.children(".roll_name").first().val();
  let roll_modifier = rollset_dom.children(".roll_modifier").first().val();
  let damage_modifier = rollset_dom.children("damage_modifier").first().val();

  _add_roll_to_rollset(rollset_dom, roll_name, roll_modifier, damage_modifier);
}

var _add_roll_to_rollset = function(rollset_dom, name, roll_modifier, damage_modifier) {
  let index = Number(rollset_dom.data("index"));
  let rollset = rollsets[index];
  rollset.add

  rollset_dom.find(".rollset_rolls > .placeholder").remove();

  roll_modifier = Number(roll_modifier);
  damage_modifier = Number(damage_modifier);

  if (!name) {
    name = "#" + String(rollset.numEntries() + 1);
  }

  let rolls_dom = rollset_dom.children(".rollset_rolls").first();
  let newroll = $("#roll_template").clone();

  let maybe_plus = modifier >= 0 ? "+" : "";
  modifier = maybe_plus + String(modifier);

  newroll.children(".name").text(name);
  newroll.children(".modifier").text(String(modifier));
  newroll.removeAttr("id");
  rolls_div.append(newroll);

  $("#rollsets .remove_roll").off("click");
  $("#rollsets .remove_roll").click(remove_roll);

  return newroll;
}

var save_data = function(e) {
  let rollsets = $("#rollsets").children(".rollset");
  let data = [];
  $.each(rollsets, function(key, value) {
    let rollset_data = [];
    let rollset = $(value);
    let rollset_name = rollset.find(".rollset_name").first().text();

    let dice_data = rollset.find(".roll_data").first();
    let dice = dice_data.data("dice");
    let sides = dice_data.data("sides");

    let rolls = rollset.find(".roll");
    $.each(rolls, function(key, value) {
      let roll = $(value);
      let name = roll.children(".name").first().text();
      let modifier = roll.children(".modifier").first().text();
      rollset_data.push({"name": name, "modifier": modifier});
    });
    data.push({"name": rollset_name, "dice": dice, "sides": sides, "rolls": rollset_data});
  });
  $("#data_loader").val(JSON.stringify(data));
}

var load_data = function(e) {
  let data = JSON.parse($("#data_loader").val());
  if (!data) {
    return;
  }
  clear_data();

  for (const rollset_data of data) {
    let rollset = _add_rollset(rollset_data.name, rollset_data.dice, rollset_data.sides);
    for (const roll_data of rollset_data.rolls) {
      let roll = _add_roll_to_rollset(rollset, roll_data.name, roll_data.modifier);
    }
  }
}

var clear_data = function() {
  $("#rollsets").children().remove();
}
