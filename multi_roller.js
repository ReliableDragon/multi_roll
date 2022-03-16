$(document).ready(function() {

  $("#add_rollset").click(add_rollset);

  let rollset = _add_rollset("Goblin Attacks");
  _add_roll_to_rollset(rollset, "Goblin Warrior", 10);
  _add_roll_to_rollset(rollset, "Goblin Wizard", -10);

  let rollset2 = _add_rollset("Goblin Damage", 2, 8);
  _add_roll_to_rollset(rollset2, "Goblin Warrior", 3);
  _add_roll_to_rollset(rollset2, "Goblin Wizard", -2);
});

let add_rollset = function(e) {
  let rollset_name_input = $("#add_rollset_name");
  let rollset_dice_input = $("#add_rollset_dice");
  let rollset_sides_input = $("#add_rollset_sides");
  let name = rollset_name_input.val();
  let dice = rollset_dice_input.val();
  let sides = rollset_sides_input.val();
  rollset_name_input.val("");
  rollset_dice_input.val("");
  rollset_sides_input.val("");
  if (!dice) {
    dice = 1;
  }
  if (!sides) {
    sides = 20;
  }
  _add_rollset(name, dice, sides);
};


var check_enter_rollset = function(event) {
    if (event.keyCode == 13) {
        add_rollset();
    }
}

let _add_rollset = function(rollset_name, dice=1, sides=20) {
  let rollsets = $("#rollsets");
  let newrollset = $("#rollset_template").clone();

  if (rollset_name) {
    newrollset.find(".rollset_name").text(rollset_name);
  } else {
    let num_rollsets = rollsets.children(".rollset").length;
    newrollset.find(".rollset_name").text("Rollset " + String(num_rollsets));
  }
  newrollset.removeAttr("id");

  let roll_placeholder = $("#roll_template").clone();
  roll_placeholder.removeAttr("id");
  roll_placeholder.addClass("placeholder");
  roll_placeholder.css("visibility", "hidden");

  let roll_results = $("#roll_result_template").clone();
  roll_results.removeAttr("id");
  let dice_data = roll_results.find(".roll_data").first();
  dice_data.text(`${dice}d${sides}`);
  dice_data.data("dice", dice);
  dice_data.data("sides", sides);

  let roll_button = $("#roll_button_template").clone();
  roll_button.removeAttr("id");

  let rollset = newrollset.children(".rollset_rolls").first();
  rollset.append(roll_button);
  rollset.append(roll_results);
  rollset.append(roll_placeholder);

  rollsets.append(newrollset);
  $("#rollsets .remove_row").off("click");
  $("#rollsets .remove_row").click(remove_rollset);
  $("#rollsets .add_roll").off("click");
  $("#rollsets .add_roll").click(add_roll_to_rollset);
  $("#rollsets .roll_button").off("click");
  $("#rollsets .roll_button").click(multiroll);
  $("#rollsets .roll_name").off("keypress");
  $("#rollsets .roll_name").keypress(check_enter_roll);
  $("#rollsets .roll_modifier").off("keypress");
  $("#rollsets .roll_modifier").keypress(check_enter_roll);

  return newrollset;
};

var check_enter_roll = function(e) {
  if (event.keyCode == 13) {
      add_roll_to_rollset(e);
  }
}

var multiroll = function(e) {
  let parent = $(event.target).parents(".rollset_rolls").first();

  let dice_data = parent.find(".roll_data").first();
  let dice = dice_data.data("dice");
  let sides = dice_data.data("sides");

  let modifier_doms = parent.find(".roll .modifier");
  let modifiers = [];
  $.each(modifier_doms, function(key, value) {
    modifiers.push(Number($(value).text()));
  });

  let rolls = [];
  let high = null;
  let low = null;

  for (const modifier of modifiers) {
    roll = 0;
    for (let i = 0; i < dice; i++) {
      roll += Math.ceil(Math.random() * sides);
    }
    roll += modifier;
    rolls.push(roll);
    if (high == null || roll > high) {
      high = roll;
    }
    if (low == null || roll < low) {
      low = roll;
    }
  }
  let result_dom = parent.find(".result_div .result.value");
  let best_dom = parent.find(".roll_result_container .best").first();
  let worst_dom = parent.find(".roll_result_container .worst").first();

  console.log(`Best: ${high} Worst: ${low}`);
  best_dom.text(String(high));
  worst_dom.text(String(low));

  let i = 0;
  $.each(result_dom, function(key, value) {
    $(value).text(String(rolls[i]));
    i++;
  });
}

var remove_roll = function(e) {
  console.log(e);
  let parent = $(event.target).parent(".roll");
  parent.remove();
}

var remove_rollset = function(e) {
  if (!confirm("Are you sure you want to remove this rollset?")) {
    return;
  }
  console.log("Removing rollset...");
  let parent = $(event.target).parents(".rollset");
  console.log(parent);
  parent.remove();
}

var add_roll_to_rollset = function(e) {
  let add_roll_div = $(event.target).parent(".add_roll_div");
  let parent_div = add_roll_div.parent(".rollset");
  let roll_name = add_roll_div.children(".roll_name").first().val();
  let roll_modifier = add_roll_div.children(".roll_modifier").first().val();

  _add_roll_to_rollset(parent_div, roll_name, roll_modifier);
}

var _add_roll_to_rollset = function(parent, name, modifier) {
  parent.find(".rollset_rolls > .placeholder").remove();

  modifier = Number(modifier);
  if (!name) {
    name = "Roll " + String(parent.find(".rollset_rolls > .roll").length);
  }

  let rolls_div = parent.children(".rollset_rolls").first();
  let newroll = $("#roll_template").clone();

  let maybe_plus = modifier >= 0 ? "+" : "";
  modifier = maybe_plus + String(modifier);

  newroll.children(".name").text(name);
  newroll.children(".modifier").text(String(modifier));
  newroll.removeAttr("id");
  rolls_div.append(newroll);
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
  clear_data();
  let data = JSON.parse($("#data_loader").val());

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
