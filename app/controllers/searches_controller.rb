class SearchesController < ApplicationController
  def index
    render 'index', layout: false
  end

  def show
    tweets =
      if params[:screen_name].present? && params[:screen_name].match(/\A@?\w+\z/)
        screen_name = params[:screen_name].match(/\A@?(\w+)\z/)[1]
        client.user_timeline(screen_name)
      elsif params[:hashtag].present?
        hashtag = params[:hashtag].starts_with?('#') ? params[:hashtag][1..-1] : params[:hashtag]
        client.search("##{hashtag}")
      end

    logger.warn tweets.size
    logger.warn tweets.first.inspect

    render 'index', layout: false
  end

  private

  def client
    @client ||= ExTwitter.new(YAML.load_file(Rails.root.join('config/twitter.yml')))
  end
end
