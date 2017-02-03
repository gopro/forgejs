

function onPrivateSwitchChange()
{
    if(jQuery('#showPrivate>input').is(':checked'))
        jQuery(".private").show();
    else
        jQuery(".private").hide();
}

jQuery('#showPrivate>input').change(onPrivateSwitchChange);
jQuery(document).ready(onPrivateSwitchChange);