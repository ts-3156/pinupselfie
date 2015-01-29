module TweetsHelper
  def phone_device?
    if agent.match(/iPhone/)
      true
    elsif agent.match(/Android/) && agent.match(/Mobile/)
      true
    else
      false
    end
  end

  def left_box_class
    if phone_device?
      'col-xs-12 col-sm-12 col-md-12 left-box'
    else
      'col-xs-12 col-sm-12 col-md-6 left-box'
    end
  end

  def right_box_class
    if phone_device?
      'col-xs-12 col-sm-12 col-md-12 right-box'
    else
      'col-xs-12 col-sm-12 col-md-6 right-box'
    end
  end

  def agent
    request.env["HTTP_USER_AGENT"]
  end
end
